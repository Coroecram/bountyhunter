"use strict";
(function() {
  if (typeof(window.Asteroids) === "undefined"){
    window.Asteroids = {};
  };


  var MediumAsteroids = Asteroids.MediumAsteroids = function(options) {
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

    MediumAsteroids.prototype = Object.create(Asteroids.Asteroid.prototype);
    MediumAsteroids.prototype.constructor = MediumAsteroids;
    MediumAsteroids.prototype.isMediumAsteroid = true;
})();
