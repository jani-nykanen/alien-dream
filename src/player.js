/**
 * The player object
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";
import { Flip } from "./core/canvas.js";
import { State } from "./core/input.js";
import { clamp } from "./core/util.js";
import { Vector2 } from "./core/vector.js";


const HURT_TIME = 90;
const KNOCKBACK_TIME = 30;


class Boomerang extends GameObject {


    constructor() {

        super(16, 16);

        this.hitbox.x = 16;
        this.hitbox.y = 16;

        this.colbox.x = 4;
        this.colbox.y = 4;

        this.friction.x = 0.1;
        this.friction.y = 0.1;

        this.exist = false;
    
        this.timer = 0;
        this.phase = 0;

        this.returnPoint = new Vector2(0, 0);
        this.startSpeed = new Vector2(0, 0);
        this.launchSpeed = 0.0;
    }


    // Spawn
    spawn(centerx, x, y, speedx, speedy, time) {

        const BASE_FRICTION = 0.05;

        this.pos = new Vector2(x, y);
        this.oldPos = new Vector2(centerx, y);

        this.speed.x = speedx;
        this.speed.y = speedy;
        this.startSpeed = this.speed.clone();
        this.target = this.speed.clone();

        this.launchSpeed = this.speed.length();
        this.friction.x = BASE_FRICTION * this.launchSpeed;
        this.friction.y = BASE_FRICTION * this.launchSpeed;

        this.returnPoint = new Vector2(x, y);

        this.timer = time;
        this.phase = 0;

        this.takeCollision = true;
        this.exist = true;

        this.flip = this.speed.x > 0 ? Flip.None : Flip.Horizontal;
    }


    // Update return point
    updateReturnPoint(x, y) {

        if (!this.exist) return;

        this.returnPoint.x = x;
        this.returnPoint.y = y;
    }


    // Update logic
    updateLogic(ev) {

        const RETURN_RANGE = 12.0;

        let t = new Vector2();
        if (this.phase == 0) {

            this.timer -= ev.step;
            if (this.timer <= 0 || 
                (ev.input.actions.fire2.state & State.DownOrPressed) == 0) {

                this.phase = 1;
            }
        } 
        else if (this.phase >= 1) {

            t.x = this.pos.x - this.returnPoint.x;
            t.y = this.pos.y - this.returnPoint.y;
            t.normalize();

            this.target.x = -t.x * this.launchSpeed;
            this.target.y = -t.y * this.launchSpeed;

            if (this.phase == 1) {

                if (Math.sign(this.startSpeed.x) != Math.sign(this.speed.x) ||
                    Math.sign(this.startSpeed.y) != Math.sign(this.speed.y)) {

                    this.phase = 2;
                }
            }

            if (Math.hypot(this.pos.x-this.returnPoint.x, 
                this.pos.y-this.returnPoint.y) < RETURN_RANGE) {

                this.exist = false;
            }
        }

        this.takeCollision = this.phase < 2;
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 4;

        this.spr.animate(0, 0, 3, ANIM_SPEED, ev.step);
    }


    // Collision events
    floorEvent(ev) {

        this.phase = 2;
        this.speed.y = 0;
    }
    wallEvent(dir, ev) {

        this.phase = 2;
        this.speed.x = 0;
    }
    ceilingEvent(ev) {

        this.phase = 2;
        this.speed.y = 0;
    }


    // Draw 
    draw(c) {

        if (!this.exist) return;
        
        c.drawSprite(this.spr, c.bitmaps.boomerang,
            Math.floor(this.pos.x)-8, 
            Math.floor(this.pos.y)-8, 
            this.flip);
    }
}



export class Player extends GameObject {


    constructor(x, y) {

        super(16, 24);

        this.pos.x = x;
        this.pos.y = y;
        this.oldPos = this.pos.clone();

        this.hitbox.x = 16;
        this.hitbox.y = 20;

        this.colbox.x = 8;

        this.friction.x = 0.1;
        this.friction.y = 0.1;

        this.center.x = 0;
        this.center.y = this.hitbox.y/2;
        
        this.jumpTimer = 0;
        this.jumpMargin = 0;

        this.hurtTimer = 0;

        this.flip = Flip.None;
        this.canJump = false;
        this.exist = true;

        this.boomerang = new Boomerang();
        this.throwAnimTimer = 0;

        // States
        this.lives = 5;
        this.maxHealth = 3;
        this.health = 3;
        this.coins = 0;

        this.isPlayer = true;

        this.deathPos = new Vector2();
    }


    // Spawn a boomerange
    spawnBoomerang() {

        const THROW_SPEED = 2.5;
        const BOOMERANGE_TIME = 15;
        const THROW_ANIM_TIME = 30;

        let dir = this.flip == Flip.None ? 1 : -1;

        this.boomerang.spawn(this.pos.x,
            this.pos.x + 8 * dir,
            this.pos.y - 8,
            THROW_SPEED * dir + this.speed.x/2,
            this.speed.y/2,
            BOOMERANGE_TIME
        );

        this.throwAnimTimer = THROW_ANIM_TIME;
    }


    // Time to die!
    die(ev) {

        const DEATH_RANGE = 144;

        this.baseMovement(ev);

        this.spr.setFrame(2, this.speed.y < 0 ? 0 : 1);

        return (this.pos.y-this.spr.height - this.deathPos.y) > DEATH_RANGE;
    }


    // Update player logic
    updateLogic(ev) {

        const JUMP_SPEED = -1.75;
        const HORIZONTAL_TARGET = 1.0;
        const GRAVITY = 2.5;
        const JUMP_TIME = 16;

        // Determine target speed
        this.target.x = 0.0;
        this.target.y = GRAVITY;

         // Update boomerang
         this.boomerang.update(ev);
         this.boomerang.updateReturnPoint(
             this.pos.x, this.pos.y-8
         );

        
        let s;
        if (this.hurtTimer <= HURT_TIME) {

            // Horizontal movement
            this.target.x = ev.input.stick.x * HORIZONTAL_TARGET;

            // Check jumping
            s = ev.input.actions.fire1.state;
            if (this.stompMargin > 0 && 
                (s & State.DownOrPressed) == 1) {

                this.jumpTimer = this.stompMargin;
            }
            else if ((this.canJump || this.jumpMargin > 0) && 
                s == State.Pressed) {

                this.jumpTimer = JUMP_TIME;

                // ev.audio.playSample(ev.audio.samples.jump, 0.50);
                this.jumpMargin = 0.0;
            }
            else if ( (s & State.DownOrPressed) == 0) {

                this.jumpTimer = 0;
            }

            // Create a boomerang
            if (!this.boomerang.exist &&
                ev.input.actions.fire2.state == State.Pressed) {

                this.spawnBoomerang();
            }
        }

        // Update timers
        if (this.jumpTimer > 0.0) {

            this.jumpTimer -= ev.step;
            this.speed.y = JUMP_SPEED;
        }
        if (this.jumpMargin > 0) {

            this.jumpMargin -= ev.step;
        }
        if (this.stompMargin > 0) {

            this.stompMargin -= ev.step;
        }
        if (this.hurtTimer > 0) {

            this.hurtTimer -= ev.step;
        }
        if (this.throwAnimTimer > 0) {

            this.throwAnimTimer -= ev.step;
            if (!this.boomerang.exist)
                this.throwAnimTimer = 0;
        }
    }


     // Post-movement events
     postMovementEvent(ev) {

        this.canJump = false;

        if (this.hurtTimer > 0) {

            this.hurtTimer -= ev.step;
        }
    }


    // Hurt
    hurt(amount, dir, ev) {

        const HURT_TIME = 120;
        const KNOCKBACK_SPEED = 2.0;

        if (this.dying || !this.exist ||
            this.hurtTimer > 0) return;

        this.hurtTimer = HURT_TIME + KNOCKBACK_TIME;
        this.health = Math.max(0, this.health-amount);

        if (this.health <= 0) {

            this.kill(ev);
        }
        else {
            
            this.speed.x = KNOCKBACK_SPEED * dir;
        }

        this.throwAnimTimer = 0.0;
        this.jumpMargin = 0;
        this.jumpTimer = 0;
    }


    // Animate
    animate(ev) {

        const EPS = 0.01;
        const AIR_DELTA = 0.5;

        if (this.hurtTimer > HURT_TIME) {

            this.spr.setFrame(1, 3);
            return;
        }

        if (Math.abs(this.target.x) > EPS) 
            this.flip = this.target.x < 0;

        let frame = 0;
        if (this.canJump) {

            if (Math.abs(this.target.x) > EPS) {

                this.spr.animate(0, 1, 4, 12 - Math.abs(this.speed.x)*4, ev.step);
            }
            else {
                
                this.spr.setFrame(0, 0);
            }
        }
        else {

            frame = 1;
            if (this.speed.y < -AIR_DELTA)
                frame = 0;
            else if (this.speed.y > AIR_DELTA)
                frame = 2;

            this.spr.setFrame(1, frame);
        }
    }


    // Kill
    kill(ev) {

        const DEATH_JUMP = -2.5;

        this.throwAnimTimer = 0;
        this.hurtTimer = 0;

        this.deathPos = this.pos.clone();

        this.speed.x = 0;
        this.target.x = 0;
        this.speed.y = DEATH_JUMP;

        this.dying = true;
        -- this.lives;
    }


    // Draw 
    draw(c) {

        if (!this.exist) return;
        
        // Draw the base sprite
        let frame = this.spr.frame;
        if (this.hurtTimer <= 0 || 
            this.hurtTimer > HURT_TIME ||
            Math.floor(this.hurtTimer/4) % 2 == 1) {

            if (this.throwAnimTimer > 0) {

                this.spr.frame += 5;
            }
            c.drawSprite(this.spr, c.bitmaps.player,
                Math.floor(this.pos.x)-8, 
                Math.floor(this.pos.y)-24 +1, 
                this.flip);

            this.spr.frame = frame;
        }

        // Draw the boomerang
        this.boomerang.draw(c);
    }


    // Collision events
    floorEvent(ev) {

        const JUMP_MARGIN_TIME = 15;

        this.speed.y = 0;
        this.jumpMargin = JUMP_MARGIN_TIME;

        this.canJump = true;
    }
    wallEvent(dir, ev) {

        this.speed.x = 0;
    }
    ceilingEvent(ev) {

        this.speed.y = 0;
        this.jumpTimer = 0;
        this.stompMargin = 0;
    }
}
