/**
 * Code based on https://medium.com/web-maker/making-asteroids-with-kontra-js-and-web-maker-95559d39b45f
 * and  https://github.com/sdepold/asteroids-workshop
 */

import { Sprite, GameLoop, degToRad, getCanvas, keyPressed, init, initKeys } from 'kontra';

// Home for all sprites of the game
let sprites = [];

// Helper method to create new asteroids
function createAsteroid(x = 100, y = 100, radius = 30) {
  return Sprite({
    type: "asteroid",
    x,
    y,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    radius,
    render() {
      this.context.strokeStyle = "white";
      this.context.beginPath();
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.stroke();
    },
  });
}

// Helper method that creates bullet instances
function createBullet(ship) {
  const cos = Math.cos(ship.rotation);
  const sin = Math.sin(ship.rotation);

  return Sprite({
    type: "bullet",
    // start the bullet on the ship at the end of the triangle
    x: ship.x + cos * 12,
    y: ship.y + sin * 12,
    // move the bullet slightly faster than the ship
    dx: ship.dx + cos * 5,
    dy: ship.dy + sin * 5,
    // live only 50 frames
    ttl: 50,
    // bullets are small
    width: 2,
    height: 2,
    color: "white",
    radius: 2,
  });
}

function createShip() {
  return Sprite({
    x: 300,
    y: 300,
    radius: 6, // we'll use this later for collision detection
    dt: 0,  // track how much time has passed
    render() {
      // draw a right-facing triangle
      this.context.strokeStyle = 'white';
      this.context.beginPath();
      this.context.moveTo(-3, -5);
      this.context.lineTo(12, 0);
      this.context.lineTo(-3, 5);
      this.context.closePath();
      this.context.stroke();
    },
    update() {
      // rotate the ship left or right
      if (keyPressed("left")) {
        this.rotation += degToRad(-4);
      } else if (keyPressed("right")) {
        this.rotation += degToRad(4);
      }

      // move the ship forward in the direction it's facing
      const cos = Math.cos(this.rotation);
      const sin = Math.sin(this.rotation);

      if (keyPressed("up")) {
        this.ddx = cos * 0.05;
        this.ddy = sin * 0.05;
      } else {
        this.ddx = this.ddy = 0;
      }
      this.advance();

      // set a max speed
      if (this.velocity.length() > 5) {
        this.dx *= 0.95;
        this.dy *= 0.95;
      }

      // allow the player to fire no more than 1 bullet every 1/4 second
      this.dt += 1 / 60;
      if (keyPressed('space') && this.dt > 0.25) {
        this.dt = 0;
        sprites.push(createBullet(this));
      }

    }
  })
}

// Initialize and start the game loop
function createLoop() {
  return GameLoop({
    update() {
      let canvas = getCanvas();

      sprites.map(sprite => {
        sprite.update();
        // asteroid is beyond the left edge
        if (sprite.x < -sprite.radius) {
          sprite.x = canvas.width + sprite.radius;
        }
        // sprite is beyond the right edge
        else if (sprite.x > canvas.width + sprite.radius) {
          sprite.x = 0 - sprite.radius;
        }
        // sprite is beyond the top edge
        if (sprite.y < -sprite.radius) {
          sprite.y = canvas.height + sprite.radius;
        }
        // sprite is beyond the bottom edge
        else if (sprite.y > canvas.height + sprite.radius) {
          sprite.y = -sprite.radius;
        }
      });

      // collision detection
      for (let i = 0; i < sprites.length; i++) {
        // only check for collision against asteroids
        if (sprites[i].type === 'asteroid') {
          for (let j = 0; j < sprites.length; j++) {
            // don't check asteroid vs. asteroid collisions
            if (sprites[j].type !== 'asteroid') {
              let asteroid = sprites[i];
              let sprite = sprites[j];
              // circle vs. circle collision detection
              let dx = asteroid.x - sprite.x;
              let dy = asteroid.y - sprite.y;
              if (Math.hypot(dx, dy) < asteroid.radius + sprite.radius) {
                asteroid.ttl = 0;
                sprite.ttl = 0;
                // split the asteroid only if it's large enough
                if (asteroid.radius > 10) {
                  for (let i = 0; i < 3; i++) {
                    sprites.push(createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2.5));
                  }
                }
                break;
              }
            }
          }
        }
      }

      sprites = sprites.filter(sprite => sprite.isAlive());
    },

    render() {
      sprites.map(sprite => sprite.render());
    },
  });
}

export function start() {
  // Initialize the kontra framework
  init();
  // Init key capture
  initKeys();
  // Create 4 asteroids
  for (let i = 0; i < 4; i++) {
    sprites.push(createAsteroid());
  }
  // Add ship sprite
  sprites.push(createShip());
  // Start game
  createLoop().start();
}
