class Star {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.xdir = random(-2, 2);
    this.ydir = random(-2, 2);
    this.s = random(3, 40);
    this.meow = random(10, 300)
    this.r = random(0, 255)
    this.g = random(0, 255)
    this.b = random(0, 255)
  }

  // star moves to edge of screen
  move() {
    this.x += this.xdir * .5;
    this.y += this.ydir * .5;
  }

  stop() {
    if (this.xdir > 0 && this.ydir > 0) {
      if (this.x > width - this.meow || this.y > height - this.meow) {
        this.xdir -= 0.5
        this.ydir -= 0.5
        if (this.xdir <= 0 || this.ydir <= 0) {
          this.xdir = 0;
          this.ydir = 0;
        }
      }
    }
    if (this.xdir > 0 && this.ydir < 0) {
      if (this.x > width - this.meow || this.y < this.meow) {
        this.xdir -= 0.5
        this.ydir += 0.5
        if (this.xdir <= 0 || this.ydir >= 0) {
          this.xdir = 0;
          this.ydir = 0;
        }
      }
    }


    if (this.xdir < 0 && this.ydir > 0) {
      if (this.x < this.meow || this.y > height - this.meow) {
        this.xdir += 0.5
        this.ydir -= 0.5
        if (this.xdir <= 0 || this.ydir >= 0) {
          this.xdir = 0;
          this.ydir = 0;
        }
      }
    }

    if (this.xdir < 0 && this.ydir < 0) {
      if (this.x < this.meow || this.y < this.meow) {
        this.xdir += 0.5
        this.ydir += 0.5
        if (this.xdir <= 0 || this.ydir >= 0) {
          this.xdir = 0;
          this.ydir = 0;
        }
      }
    }


  }

  freeze() {
    this.xdir = 0;
    this.ydir = 0;
  }

  // reverse direction
  moveFaster() {
    this.x -= this.xdir * 1.5
    this.y -= this.ydir * 1.5
  }
  // display ellipses
  display() {
    fill(this.r, this.g, this.b, 127);

    noStroke();
    //triangle(this.x - 10, this.y - 10, this.x, this.y + 10, this.x + 10, this.y - 10);
    //fill('red');
    ellipse(this.x, this.y, this.s, this.s);
    //ellipse(500, 300, 50,50);
    // console.log("display a star", this.x/10);
  }
  // check if ellipse reach the edge, return true or false
  finished() {
    return this.y > height || this.y < 0;
  }
  // check if stars reach to center area
  reverseFinished() {
    return (this.y < height / 2 + 0.5 && this.y > height / 2 - 0.5) || (this.x < width / 2 + 0.5 && this.x > width / 2 - 0.5)
  }
  // 0 speed for stars
  reverseReset() {
    this.x = width / 2;
    this.y = height / 2;
    this.xdir = 0;
    this.ydir = 0;
  }
  // ellipse go from center again
  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.xdir = random(-5, 5);
    this.ydir = random(-5, 5);
  }
}