var SpaceHipster = SpaceHipster || {};
//title screen
SpaceHipster.Game = function(){};

SpaceHipster.global = {
		skillLevel : [50, 150],
		asteriodSize : Math.floor(Math.random() * 100) + 0,
		bulletTime : 0
  };

SpaceHipster.Game.prototype = {
  create: function() {
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

    //create player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
    this.player.scale.setTo(2);
    this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
    this.player.animations.play('fly');
	this.player.anchor.set(0.5);
	
	//player bullets
	this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, 'bulletImage');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 1);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
	
	// Create the emitter with 15 particles. We don't need to set the x y
	// Since we don't know where to do the explosion yet
	this.emitter = this.game.add.emitter(0, 0, 15);

	// Set the 'pixel' image for the particles
	this.emitter.makeParticles('pixel');

    //player initial score of zero
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
    this.playerSpeed = 200;
    this.player.body.collideWorldBounds = true;

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteriods();

    //show score
    this.showLabels();

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
	this.asteroidDeathSound = this.game.add.audio('asteroidDeath');
	
	 this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
    ]);
  },
  update: function() {
	
   if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 100, this.player.body.acceleration);
    }
    else
    {
        this.player.body.acceleration.set(0);
    }
	
	if(this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
		this.game.physics.arcade.accelerationFromRotation(this.player.rotation, -100, this.player.body.acceleration);
	}

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
        this.player.body.angularVelocity = -300;
    }
    else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
        this.player.body.angularVelocity = 300;
    }
    else
    {
        this.player.body.angularVelocity = 0;
    }
	
	if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
		this.shootBullet();
	}

    //collision between player and asteroids
    this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);

    //overlapping between player and collectables
    this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
	this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.bulletCollision, null, this);
	
	this.angleLabel.text = 'Angle:' + this.player.rotation;
  },
  
  shootBullet: function() {
	  //  To avoid them being allowed to fire too fast we set a time limit
    if (this.game.time.now > SpaceHipster.global.bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = this.bullets.getFirstExists(false);

        if (bullet)
        {
			//  And fire it
			bullet.reset(this.player.x, this.player.y);
            bullet.body.velocity.y = -400;
            SpaceHipster.global.bulletTime = this.game.time.now + 500;
        }
    }
  },
  
  bulletCollision: function(bullet, asteriod){
	//  When a bullet hits an asteroid we kill them both
    bullet.kill();
    asteriod.kill();
	
	this.emitter.x = asteriod.x;
	this.emitter.y = asteriod.y;
	this.emitter.start(true, 800, null, 15);
	this.asteroidDeathSound.play();
  },
  
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(100, 150)
    var collectable;

    for (var i = 0; i < numCollectables; i++) {
      //add sprite
      collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
      collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
      collectable.animations.play('fly');
    }

  },
  generateAsteriods: function() {
    this.asteroids = this.game.add.group();
    
    //enable physics in them
    this.asteroids.enableBody = true;

    //phaser's random number generator
    this.numAsteroids = this.game.rnd.integerInRange(SpaceHipster.global.skillLevel[0], SpaceHipster.global.skillLevel[1]);
	
	this.generateAsteriod();
  },
  
  generateAsteriod: function() {
	  var rndmArr = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5];
	  var asteriod;

    for (var i = 0; i < this.numAsteroids; i++) {
		
	var astGen = Phaser.ArrayUtils.getRandomItem(rndmArr);
      //add sprite
      asteriod = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
      asteriod.scale.setTo(astGen);
	
		if(astGen > 3){
		//physics properties
		asteriod.body.velocity.x = this.game.rnd.pick([-1, 1]) * (astGen * 2);
		asteriod.body.velocity.y = this.game.rnd.pick([-1, 1]) * (astGen * 2);
		asteriod.body.immovable = true;
		asteriod.body.collideWorldBounds = true;
		}
		else{
			asteriod.body.velocity.x = this.game.rnd.pick([-1, 1]) * (astGen * 10);
			asteriod.body.velocity.y = this.game.rnd.pick([-1, 1]) * (astGen * 10);
			asteriod.body.immovable = true;
			asteriod.body.collideWorldBounds = true;
		}
    }
  },
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    this.player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
	this.angleLabel = this.game.add.text(this.width-100, this.game.height - 100, 'angle:' + this.player.angle, style);
	this.angleLabel.fixedToCamera = true;
  }
};

/*
TODO

-audio
-asteriod bounch
*/
