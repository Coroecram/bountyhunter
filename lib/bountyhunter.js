

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js from "index.js" begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* Last merge : Tue Jan 26 17:29:37 EST 2016  */

/* Merging order :

- utils.js
- gameView.js
- game.js
- pauseScreen.js
- gameOver.js
- movingObject.js
- ship.js
- woolongs.js
- asteroid.js
- medium_asteroid.js
- mini_asteroid.js
- bullet.js

*/


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined") {
    window.Asteroids = {};
  };

  var Util = Asteroids.Util = {};

  Util.inherits = function (ChildClass, ParentClass) {
    var Surrogate = function () {};
    Surrogate.prototype = ParentClass.prototype;
    ChildClass.prototype = new Surrogate();
    ChildClass.prototype.constructor = ChildClass;
  };

  Util.vector = function (angle) {
    return [Math.cos((angle * Math.PI)/180), Math.sin((angle * Math.PI)/180)];
  };

  Util.randomVector = function (length) {
    var deg = 2 * Math.PI * Math.random();

    return Util.magnitude([Math.sin(deg), Math.cos(deg)], length);
  };

  Util.magnitude = function (vec, amount) {
    return [vec[0] * amount, vec[1] * amount];
  };

  Util.distance = function (pos1, pos2) {
    return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) +
                              Math.pow(pos1[1] - pos2[1], 2));
  };

  Util.asteroidRotation = function () {
    var rotation = Math.random();
    return rotation * Math.floor(Math.random()*2) == 1 ? 1 : -1;
  };

  Util.asteroidSplitter = function (seed, type) {
    var positions = [[seed.pos[0]-20, seed.pos[1]-20],
                     [seed.pos[0]+20, seed.pos[1]+20]];

    var vectors = Asteroids.Util.splitParentVector(seed.vector);
    var constructor = (type === "medium" ? Asteroids.MediumAsteroids :
                                           Asteroids.MiniAsteroids)

    return [new constructor({pos: seed.pos, vector: vectors[0], game: game}),
            new constructor({pos: seed.pos, vector: vectors[1],  game: game})];
  };

  Util.splitParentVector = function (seedVector) {
    var scaledLength = seedVector.length * 1.5;
    var origRadians = Math.atan2(seedVector[0], seedVector[1]);
    var firstAngle = origRadians + 0.785;
    var secondAngle = origRadians - 0.785;
    return [Util.magnitude([Math.sin(firstAngle), Math.cos(firstAngle)], scaledLength),
    Util.magnitude([Math.sin(secondAngle), Math.cos(secondAngle)], scaledLength)];
  };

  Util.sortNumbers = function (a, b) {
    return a - b;
  };

  Util.shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

      return array;
  };

  Util.positionDistributor = function (xMax, yMax, objectPos) {
    var sectors = [0, 0, 0, 0, 0, 0]
    var xCutoff = xMax/3;
    var yCutoff = yMax/2;
    for (var i = 0; i < objectPos.length; i++) {
      var sectorKey = [Math.floor(objectPos[i][0] / xCutoff),
                       Math.floor(objectPos[i][1] / yCutoff)];
      switch(sectorKey.join()) {
        case '0,0':
          sectors[0] += 1;
          break;
        case '1,0':
          sectors[1] += 1;
          break;
        case '2,0':
          sectors[2] += 1;
          break;
        case '0,1':
          sectors[3] += 1;
          break;
        case '1,1':
          sectors[4] += 1;
          break;
        case '2,1':
          sectors[5] += 1;
          break;
      }
    }
    var leastPopulated = Util.leastPopulatedSector(sectors);
    return Util.randomPos(xCutoff, yCutoff, leastPopulated);
  };

  Util.leastPopulatedSector = function (sectors) {
    var min = Math.min.apply(null, sectors);
    var minIndices = [];
    for (var i = 0; i < sectors.length; i++){
      if (sectors[i] === min) {
        minIndices.push(i);
      }
    }
    if (minIndices.length === 1) {
      return minIndices[0];
    } else {
      return minIndices[Math.floor(Math.random() * minIndices.length)];
    }
  };

  Util.randomPos = function (xCutoff, yCutoff, leastPopulated) {
    var multiples = [[0,0], [1,0], [2,0], [0,1], [1,1], [2,1]][leastPopulated];
    return [Math.random() * xCutoff + multiples[0] * xCutoff,
            Math.random() * yCutoff + multiples[1] * yCutoff]
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: gameView.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function (){
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  }

  var GameView = Asteroids.GameView = function (ctx, game) {
    this.ctx = ctx
    this.game = game;
    this.loopID = 0;
    this.ship = this.game.ship;
  }

  GameView.prototype.start = function () {
    this.bindKeyHandlers();
    var self = this;
    self.loopID = window.setInterval(function () {
      self.game.loop();
    }, 20);
  };

  GameView.prototype.togglePause = function () {
    if (this.game.isOver()){
      this.game.reset();
    }
  };

  GameView.prototype.bindKeyHandlers = function () {
    var self = this;

    key("up", function (e) { e.preventDefault(); });
    key("left", function (e) { e.preventDefault(); });
    key("down", function (e) { e.preventDefault(); });
    key("right", function (e) { e.preventDefault(); });
    key("space", function (e) { e.preventDefault(); });
    key("enter", function (e) {
                                e.preventDefault();
                                self.game.togglePause();
                              });
  };

  GameView.prototype.isGameView = function () {
    true;
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: game.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined") {
    window.Asteroids = {};
  };

  var Game = Asteroids.Game = function (ctx) {
    this.positions = [];
    this.asteroids = [];
    this.mediumAsteroids = [];
    this.miniAsteroids = [];
    this.woolongs = [];
    this.ship = [];
    this.bullets = [];
    this.gameView = {};
    this.gameOver = false;
    this.startTime = Date.now();
    this.gameView = new Asteroids.GameView(ctx, this)
    this.stats = {maxCredits: 250000,
                  totalCredits: 0,
                  shipsLost: 0,
                  misslesFired: 0,
                  asteroidCount: 0};
    this.credits = 250000;
    this.pauseScreen = new Asteroids.PauseScreen();
    this.paused = true;

    this.start();
    this.gameView.start();
  };

  Game.DIM_X = 667;
  Game.DIM_Y = 533;
  Game.CANVAS_Y = 633;
  Game.NUM_ASTEROIDS = 3;
  var Util = Asteroids.Util;

  Game.prototype.start = function () {
    this.addShip();
    this.addAsteroids();
    this.addWoolongs();
  };

  Game.prototype.add = function (object) {
    if (object.isAsteroid) {
      this.asteroids.push(object);
    } else if (object.isBullet) {
        this.stats.misslesFired += 1;
        this.bullets.push(object);
    } else if (object.isShip) {
        this.ship.push(object);
    } else if (object.areWoolongs) {
      this.woolongs.push(object)
    }
  };

  Game.prototype.addShip = function () {
    var ship = new Asteroids.Ship(
      { pos: [(Game.DIM_X/2),
        (Game.CANVAS_Y/2)],
        angle: 0,
        game: this,
        invincible: true}
      );
      this.add(ship);
      window.setTimeout(function () { ship.inPlay() } , 2500);
  };

  Game.prototype.addAsteroids = function () {
    for (var i = 0; i < Game.NUM_ASTEROIDS; i++) {
      this.add(new Asteroids.Asteroid({ game: this }));
    }
  };

  Game.prototype.addWoolongs = function (asteroid) {
    if (this.woolongs.length >= 10) {
      this.woolongs = [];
    }
    var woolongs = new Asteroids.Woolongs({ game: this,
                                            pos: asteroid ? asteroid.pos : false,
                                            asteroid: asteroid,
                                            invincible: true })
    this.add(woolongs);
    window.setTimeout(function () { woolongs.inPlay() }, 500);
  };

  Game.prototype.addCredits = function(woolongs) {
        this.stats.totalCredits += woolongs.value;
      this.credits += woolongs.value;
      if (this.stats.maxCredits < this.credits) {
        this.stats.maxCredits = this.credits;
      }
  };

  Game.prototype.allObjects = function () {
    return [].concat(this.asteroids, this.ship, this.mediumAsteroids, this.miniAsteroids, this.bullets, this.woolongs).reverse();
  };

  Game.prototype.allSpawnedObjects = function () {
    return [].concat(this.ship, this.bullets, this.woolongs, this.asteroids, this.mediumAsteroids, this.miniAsteroids);
  };

  Game.prototype.draw = function (ctx) {
    ctx.clearRect(0, 100, Game.DIM_X, Game.DIM_Y);
    this.isOver();

    this.allObjects().forEach(function (object) {
        object.draw(ctx);
        ctx.clearRect(0, 0, Game.DIM_X, 100);
    });
    ctx.fillStyle = 'lightgreen';
    ctx.font = '24px OrbitronLight';
    ctx.textBaseline = 'top';
    var figures = this.credits.toString().length + 1;
    ctx.fillText ("Woolong Balance: " + (this.credits -= 1),
                                     (420-(Math.ceil(figures * 18.33))),
                                      50);
    this.credits -= 10;
  };

  Game.prototype.pauseDraw = function (ctx) {
    ctx.clearRect(0, 100, Game.DIM_X, Game.DIM_Y);
    this.isOver();

    this.allObjects().forEach(function (object) {
        object.pauseDraw(ctx);
        ctx.clearRect(0, 0, Game.DIM_X, 100);
    });
    ctx.fillStyle = 'lightgreen';
    ctx.font = '24px OrbitronLight';
    ctx.textBaseline = 'top';
    var figures = this.credits.toString().length + 1;
    ctx.fillText ("Woolong Balance: " + (this.credits),
                                     (420-(Math.ceil(figures * 18.33))),
                                      50);
  };

  Game.prototype.isOver = function () {
    if (this.credits <= 0) {
      this.stats.timePlayed = Date.now() - this.startTime;
      if (!this.gameOver) {
        this.gameOver = new Asteroids.GameOver(this.stats);
      }
      return true;
    } else {
      return false;
    }
  };

  Game.prototype.reset = function () {
    this.asteroids = [];
    this.ship = [];
    this.mediumAsteroids = [];
    this.miniAsteroids = [];
    this.woolongs = [];
    this.bullets = [];
    this.startTime = Date.now();
    this.stats = {maxCredits: 250000,
                  totalCredits: 0,
                  shipsLost: 0,
                  misslesFired: 0,
                  asteroidCount: 0};
    this.gameOver = false;
    this.credits = 250000;

    this.start();
  };

  Game.prototype.moveObjects = function () {
    this.allObjects().forEach(function (object) {
      object.move();
    });
  };

  Game.prototype.outOfBounds = function (pos) {
    return (pos[0] < 0) || (pos[1] < 100) ||
      (pos[0] > Game.DIM_X) || (pos[1] > Game.CANVAS_Y);
  };

  var wrapper = function (pos, max) {
    var cutoff = (max === 667 ? 0 : 100);
    if (pos < cutoff) {
      return max - (pos % max) + cutoff;
    } else if (pos > max) {
      return pos % max + cutoff;
    } else {
      return pos;
    }
  };

  Game.prototype.wrap = function (pos) {
    return [ wrapper(pos[0], Game.DIM_X), wrapper(pos[1], Game.CANVAS_Y)];
  };

  Game.prototype.checkCollisions = function () {
    var allObjects = this.allObjects();
    allObjects.forEach(function (obj1) {
      allObjects.forEach(function (obj2) {
        if (obj1 == obj2) {
          return;
        }

        if (obj1.isCollidedWith(obj2)) {
          obj1.collideWith(obj2);
        }
      });
    });
  };

  Game.prototype.allPositions = function () {
    this.positions = [];
    this.allSpawnedObjects().forEach(function (object) {
      this.positions.push(object.pos);
    }.bind(this));
  };

  Game.prototype.reasonablePosition = function () {
    this.allPositions();
    if (this.positions.length != 0){
      return Util.positionDistributor(Game.DIM_X, Game.CANVAS_Y, this.positions);
    }
  };

  Game.prototype.step = function () {
    this.moveObjects();
    this.checkCollisions();
  };

  Game.prototype.remove = function (object){
    if (object.isBullet) {
      this.bullets.splice(this.bullets.indexOf(object), 1);
    } else if (object.isAsteroid) {
      this.stats.asteroidCount += 1;
      this.asteroidDestroyed(object);
    } else if (object.isShip) {
      this.bullets = [];
      this.stats.shipsLost += 1;
      this.ship[0].relocate();
    } else if (object.areWoolongs) {
      this.woolongs.splice(this.woolongs.indexOf(object), 1);
      this.addWoolongs();
    }
  };

  Game.prototype.asteroidDestroyed = function (asteroid) {
    if (asteroid.isMediumAsteroid) {
      var minis = Util.asteroidSplitter(asteroid, "mini");
      var idx = this.mediumAsteroids.indexOf(asteroid);
      this.mediumAsteroids.splice(idx, 1);
      this.miniAsteroids = this.miniAsteroids.concat(minis);
    } else if (asteroid.isMiniAsteroid) {
      var idx = this.miniAsteroids.indexOf(asteroid);
      this.miniAsteroids.splice(idx, 1);
    } else {
      var mediums = Util.asteroidSplitter(asteroid, "medium");
      idx = this.asteroids.indexOf(asteroid);
      this.asteroids[idx] = new Asteroids.Asteroid({ game: this });
      this.mediumAsteroids = this.mediumAsteroids.concat(mediums);
    }
    this.addWoolongs(asteroid);
  };

  Game.prototype.keysPressed = function () {
    var ship = this.ship[0];
    key.getPressedKeyCodes().forEach(function(key) {
      switch(key) {
        case 87:
        case 38:
          return ship.thrust("forward");
        case 83:
        case 40:
          return ship.thrust("reverse");
        case 65:
        case 37:
          return ship.turn("left");
        case 68:
        case 39:
          return ship.turn("right");
        case 32:
          return ship.fireBullet("reverse");
        }
    });
  };

  Game.prototype.togglePause = function () {
    if (this.isOver()) {
      return this.reset();
    }
    this.paused = !this.paused;
  };

  Game.prototype.loop = function () {
    if (!this.paused && !this.isOver()) {
      this.keysPressed();
      this.draw(this.gameView.ctx);
      this.step();
    } else if (this.paused) {
      this.pauseDraw(this.gameView.ctx);
      this.pauseScreen.draw(this.gameView.ctx);
    } else if (this.isOver()) {
      this.gameOver.draw(this.gameView.ctx);
    }
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: pauseScreen.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };

  var PauseScreen = Asteroids.PauseScreen = function (options) {
    this.ship = new Image();
    this.ship.src = './assets/img/scaled-swordfish-pause.gif';
    this.missle = new Image();
    this.missle.src = './assets/img/missle-pause.png';
    this.coin = new Image();
    this.coin.src = './assets/img/coin-pause.png';
    this.money = new Image();
    this.money.src = './assets/img/scaled-money-pause.gif';
    this.bag = new Image();
    this.bag.src = './assets/img/scaled-bag-pause.png';
  };


  PauseScreen.prototype.draw = function(ctx){
    ctx.fillStyle= "black";
    ctx.fillRect(133, 115, 400, 485);

    ctx.fillStyle = 'white';
    ctx.font = '48px Roundup';
    ctx.textBaseline = 'top';
    ctx.fillText("Howdy Amigo!", 233, 115);
    ctx.fillText("Go get 'em bucakroo!", 180, 545)

    ctx.font = '24px OrbitronLight';
    ctx.fillStyle = "lightgreen";
    ctx.fillText("WOOLONGS", 163, 175);
    ctx.drawImage(this.ship, 163, 205, 30, 25);
    ctx.drawImage(this.missle, 163, 235, 30, 25);
    ctx.drawImage(this.coin, 163, 265, 30, 25);
    ctx.drawImage(this.money, 163, 295, 30, 25);
    ctx.drawImage(this.bag, 163, 325, 30, 25);
    ctx.font = '20px OrbitronLight';
    ctx.textBaseline = 'top';
    ctx.fillText("5000 - 9999", 253, 270);
    ctx.fillText("10000 - 29999", 253, 300);
    ctx.fillText("30000 - 50000", 253, 330);
    ctx.fillStyle = "red";
    ctx.fillText("50000", 253, 210);
    ctx.fillText("10000", 253, 240);

    ctx.font = '18px OrbitronLight';
    ctx.fillStyle = 'white';
    ctx.fillText("CONTROLS", 163, 365)
    ctx.fillText("W / UP", 163, 390), ctx.fillText("FORWARD THRUST", 313, 390);
    ctx.fillText("A / LEFT", 163, 415), ctx.fillText("LEFT TURN", 313, 415);
    ctx.fillText("S / DOWN", 163, 440), ctx.fillText("REVERSE THRUST", 313, 440);
    ctx.fillText("D / RIGHT", 163, 465), ctx.fillText("RIGHT TURN", 313, 465);
    ctx.fillText("SPACE", 163, 490), ctx.fillText("FIRE MISSLE", 313, 490);
    ctx.font = '22px Orbitron';
    ctx.fillStyle = 'green'
    ctx.fillText("ENTER", 163, 515), ctx.fillText("(UN)PAUSE", 313, 515);
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: gameOver.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };

  var GameOver = Asteroids.GameOver = function (options) {
    this.image = new Image();
    this.src = './assets/img/gameover.jpg';
    this.misslesFired = options.misslesFired;
    this.shipsLost = options.shipsLost;
    var seconds = ((options.timePlayed/1000).toFixed(2)) % 60;
    var minutes = options.timePlayed/1000/60 << 0;
    this.timePlayed = minutes + ':' + (seconds < 10 ? "0" + seconds : seconds);
    this.totalCredits = options.totalCredits;
    this.maxCredits = options.maxCredits;
    this.asteroidCount = options.asteroidCount;
  };

  GameOver.prototype.draw = function(ctx){
    this.image.src = this.src;
    ctx.clearRect(0, 0, 667, 100);
    ctx.drawImage(this.image, 0, 100, 667, 533);

    ctx.textAlign = "left"
    ctx.font = '40px OrbitronBold';
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", 203, 145);
    ctx.font = '24px OrbitronBold';
    ctx.fillStyle = "white";
    ctx.fillText("TIME PLAYED", 23, 235);
    ctx.fillText("CREDITS COLLECTED", 23, 285);
    ctx.fillText("MAX CREDITS", 23, 335);
    ctx.fillText("SHIPS CRASHED", 23, 385);
    ctx.fillText("MISSLES FIRED", 23, 435);
    ctx.fillText("ASTEROIDS DESTROYED", 23, 485);

    ctx.font = '24px OrbitronLight';
    ctx.textAlign = "right"
    ctx.fillText(this.timePlayed, 613, 235);
    ctx.fillText(this.totalCredits, 613, 285);
    ctx.fillText(this.maxCredits, 613, 335);
    ctx.fillText(this.shipsLost, 613, 385);
    ctx.fillText(this.misslesFired, 613, 435);
    ctx.fillText(this.asteroidCount, 613, 485);

    ctx.fillStyle = "lightgreen";
    ctx.fillText("Press ENTER to Play Again!", 523, 535);
    ctx.textAlign = "left"
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: movingObject.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function() {
  if (typeof(window.Asteroids) === "undefined") {
    window.Asteroids = {};
  };

  var MovingObject = Asteroids.MovingObject = function (options) {
    this.pos = options.pos;
    this.vector = options.vector;
    this.radius = options.radius;
    this.angle = options.angle;
    this.rotation = options.rotation;
    this.invincible = options.invincible || false;
    this.image = new Image();
    this.src = options.src;
    this.dim = this.radius * 2;
    this.offset = -this.radius

    this.game = options.game;
  };

  MovingObject.prototype.draw = function(ctx){
    if (this.isShip && this.invincible) {
      ctx.fillStyle = '#EEC900';

      ctx.beginPath();
      ctx.arc(
        this.pos[0], this.pos[1], this.radius, 0, 2 * Math.PI, true
      );
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.pos[0], this.pos[1]);
    ctx.rotate((this.angle += this.rotation) * Math.PI/180);
    this.image.src = this.src;
    ctx.drawImage(this.image, 0, 0,
                              this.dim, this.dim,
                              this.offset, this.offset,
                              this.dim, this.dim);
    ctx.restore();
  };

  MovingObject.prototype.pauseDraw = function(ctx){
    ctx.save();
    ctx.translate(this.pos[0], this.pos[1]);

    ctx.rotate((this.angle) * Math.PI/180);
    this.image.src = this.src;
    ctx.drawImage(this.image, 0, 0,
                              this.dim, this.dim,
                              this.offset, this.offset,
                              this.dim, this.dim);
    ctx.restore();
  };

  MovingObject.prototype.move = function (timePassed) {
    var delta = [this.vector[0], this.vector[1]];

    this.pos = [this.pos[0] + delta[0], this.pos[1] + delta[1]];
    if (this.game.outOfBounds(this.pos)) {
      if (this.wrappable) {
        this.pos = this.game.wrap(this.pos);
      } else {
        this.game.remove(this);
      }
    }
  };

  MovingObject.prototype.wrappable = true;

  MovingObject.prototype.inPlay = function () {
    this.invincible = false;
  };

  MovingObject.prototype.isCollidedWith = function (otherObj) {
    var objDistance = Asteroids.Util.distance(this.pos, otherObj.pos);
    return objDistance < this.radius + otherObj.radius
  };

  MovingObject.prototype.collideWith = function (otherObj) {
    if (this.isBullet && otherObj.isAsteroid) {
        this.game.remove(this);
        otherObj.game.remove(otherObj);
    } else if (this.isShip && otherObj.isAsteroid) {
      if (!this.invincible) {
        this.game.remove(this);
      }
    } else if (this.isShip && otherObj.areWoolongs) {
        this.game.addCredits(otherObj);
        otherObj.game.remove(otherObj);
    } else if (this.isBullet && otherObj.areWoolongs) {
        this.game.remove(this);
        otherObj.game.remove(otherObj);
    } else if (this.isAsteroid && otherObj.areWoolongs) {
      if (!otherObj.invincible) {
        otherObj.game.remove(otherObj);
      };
    }
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: ship.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };

  var Ship = Asteroids.Ship = function (options) {
    options.radius = Ship.RADIUS;
    options.vector = options.vector || [0, 0];
    options.angle = options.angle;
    options.src = './assets/img/scaled-swordfish.gif';
    options.rotation = 0;
    this.reloading = false;
    this.lastMissle = true;

    Asteroids.MovingObject.call(this, options);
  };

  Ship.RADIUS = 21.5;
  Asteroids.Util.inherits(Ship, Asteroids.MovingObject);

  Ship.prototype.thrust = function (direction) {
    if (this.game.paused) {
      return
    };
    var thruster = Asteroids.Util.vector(this.angle + 90);
    if (direction === "forward"){
      thruster[0] *= -0.25;
      thruster[1] *= -0.25;
    } else {
      thruster[0] *= 0.125;
      thruster[1] *= 0.125;
    }

    this.maxThrustCheck(thruster);
  };

  Ship.prototype.maxThrustCheck = function (addedVector) {
    if (Math.abs(this.vector[0] + addedVector[0]) < 3) {
          this.vector[0] += addedVector[0];
          this.game.credits -= 100;
    }
    if (Math.abs(this.vector[1] + addedVector[1]) < 3) {
        this.vector[1] += addedVector[1];
        this.game.credits -= 100;
    }
  };

  Ship.prototype.turn = function (direction) {
    if (this.game.paused) {
      return
    };
    this.game.credits -= 3;
    if (direction == "right") {
      this.angle += 5
    } else {
      this.angle -= 5
    }
  };

  Ship.prototype.fireBullet = function () {
    if (this.game.paused) {
      return
    };

    var bulletVector = Asteroids.Util.magnitude(
      Asteroids.Util.vector(this.angle - 90),
      Asteroids.Bullet.SPEED
    );

    var bulletVector = [
      bulletVector[0] + this.vector[0], bulletVector[1] + this.vector[1]
    ];

    var bullet = new Asteroids.Bullet({
      pos: this.pos,
      vector: bulletVector,
      angle: this.angle,
      game: this.game
    });

    var recoil = [bulletVector[0] / -150, bulletVector[1] / -150]
    this.maxThrustCheck(recoil)

    if (!this.reloading && this.game.credits > 11000) {
      var ship = this;
      this.game.add(bullet);
      this.game.credits -= 10000;
      this.reloading = true;
      setTimeout(this.reload.bind(this), 750);
    }
  };

  Ship.prototype.reload = function () {
    this.reloading = false;
  };

  Ship.prototype.relocate = function () {
    var self = this;
    self.game.credits -= 50000;
    self.pos = self.game.reasonablePosition();
    self.vector = [0, 0];
    self.angle = 0;
    self.invincible = true;

    window.setTimeout(function () { self.inPlay() } , 1500);
  };

  Ship.prototype.isShip = true;
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: woolongs.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };

  var Woolongs = Asteroids.Woolongs = function (options) {
    this.calcValue(options.asteroid);
    options.pos = options.pos || options.game.reasonablePosition();
    options.radius = Woolongs.RADIUS;
    options.vector = [0, 0];
    options.src = this.src;

    Asteroids.MovingObject.call(this, options);
  };

  Woolongs.RADIUS = 16;
  Woolongs.image = new Image();
  Asteroids.Util.inherits(Woolongs, Asteroids.MovingObject);

  Woolongs.prototype.areWoolongs = true;

  Woolongs.prototype.calcValue = function (asteroid) {
    var base = Math.random();
    if (asteroid) {
      if (asteroid.isMediumAsteroid) {
        this.value = Math.floor(((Math.random()*20 + 10) * 1000));
        this.src = './assets/img/scaled-money.gif';
      } else if (asteroid.isMiniAsteroid) {
        this.value = Math.floor(((Math.random()*20 + 30) * 1000));
        this.src = './assets/img/scaled-bag.png';
      } else {
        this.value = Math.floor(((Math.random()*5 + 5) * 1000));
        this.src = './assets/img/coin.png';
      }
    } else if (1-base < 0.4) {
      this.value = Math.floor(((Math.random()*5 + 5) * 1000));
      this.src = './assets/img/coin.png';
    } else if (1 - base > 0.95) {
      this.value = Math.floor(((Math.random()*20 + 30) * 1000));
      this.src = './assets/img/scaled-bag.png';
    } else {
        this.value = Math.floor(((Math.random()*20 + 10) * 1000));
        this.src = './assets/img/scaled-money.gif';
      return
    }
  };
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: asteroid.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };

  var Asteroid = Asteroids.Asteroid = function (options) {
    options.color = Asteroid.COLOR;
    options.pos = options.pos || options.game.reasonablePosition();
    options.radius = Asteroid.RADIUS;
    options.angle = 0;
    options.rotation = Asteroids.Util.asteroidRotation();
    options.src = './assets/img/asteroid-large.png'
    options.vector = options.vector || Asteroids.Util.randomVector(Asteroid.SPEED);

    Asteroids.MovingObject.call(this, options);
  };

  Asteroid.COLOR = "#008080";
  Asteroid.RADIUS = 29;
  Asteroid.SPEED = 2;

  Asteroids.Util.inherits(Asteroid, Asteroids.MovingObject);

  Asteroid.prototype.isAsteroid = true;
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: medium_asteroid.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };


  var MediumAsteroids = Asteroids.MediumAsteroids = function (options) {
      options.color = MediumAsteroids.COLOR;
      options.pos = options.pos
      options.radius = MediumAsteroids.RADIUS;
      options.angle = 0;
      options.rotation = Asteroids.Util.asteroidRotation();
      options.src = './assets/img/asteroid-medium.png'

      Asteroids.MovingObject.call(this, options);
    };

    MediumAsteroids.COLOR = "#505050";
    MediumAsteroids.RADIUS = 17.5;

    Asteroids.Util.inherits(MediumAsteroids, Asteroids.MovingObject);
    Asteroids.Util.inherits(MediumAsteroids, Asteroids.Asteroid);

    MediumAsteroids.prototype.isMediumAsteroid = true;
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: mini_asteroid.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };


  var MiniAsteroids = Asteroids.MiniAsteroids = function (options) {
      options.color = MiniAsteroids.COLOR;
      options.radius = MiniAsteroids.RADIUS;
      options.angle = 0;
      options.rotation = Asteroids.Util.asteroidRotation();
      options.src = './assets/img/asteroid-mini.png'

      Asteroids.MovingObject.call(this, options);
    };

    MiniAsteroids.COLOR = "#FFA500";
    MiniAsteroids.RADIUS = 12.5;

    Asteroids.Util.inherits(MiniAsteroids, Asteroids.MovingObject);
    Asteroids.Util.inherits(MiniAsteroids, Asteroids.Asteroid);

    MiniAsteroids.prototype.isMiniAsteroid = true;
})();


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: bullet.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


"use strict";
(function () {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };

  var Bullet = Asteroids.Bullet = function (options) {
    options.radius = Bullet.RADIUS;
    options.angle = options.angle;
    options.src = './assets/img/missle.png';
    options.rotation = 0;

    Asteroids.MovingObject.call(this, options);
  };

  Bullet.RADIUS = 10;
  Bullet.SPEED = 6;
  Asteroids.Util.inherits(Bullet, Asteroids.MovingObject);


  Bullet.prototype.wrappable = false;
  Bullet.prototype.isBullet = true;
})();