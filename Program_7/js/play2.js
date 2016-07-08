var playState2 = {

    create: function() { 

        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
		
		this.player.animations.add('left', [0], 8, true);
		this.player.animations.add('right', [2], 8, true);

        this.createWorld();

        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);
		
		// Create the emitter with 15 particles. We don't need to set the x y
		// Since we don't know where to do the explosion yet
		this.emitter = game.add.emitter(0, 0, 15);

		// Set the 'pixel' image for the particles
		this.emitter.makeParticles('pixel');

		// Set the x and y speed of the particles between -150 and 150
		// Speed will be randomly picked between -150 and 150 for each particle
		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);

		// Scale the particles from 2 time their size to 0 in 800ms
		// Parameters are: startX, endX, startY, endY, duration
		this.emitter.setScale(2, 0, 2, 0, 800);

		// Use no gravity
		this.emitter.gravity = 0;

        this.scoreLabel = game.add.text(30, 30, 'Delegates: 0', { font: '18px Arial', fill: '#ffffff' });
        game.global.score = 0;

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
		
		//I put 122 so it syncs up with the actual timer display
		game.time.events.add(Phaser.Timer.SECOND * 122, this.gameEnd, this);
		this.gameClock = game.add.text(250, 30, 'Seconds Till Convention: 120', { font: '18px Arial', fill: '#ffffff'});
		
		this.intTime = 120;
		game.time.events.loop(Phaser.Timer.SECOND, this.gameTime, this);
		
		this.jumpSound = game.add.audio('jump');
		this.coinSound = game.add.audio('coin');
		this.deadSound = game.add.audio('dead');
		this.victorySound = game.add.audio('victory');
		
		this.music = game.add.audio('music'); // Add the music
		this.music.loop = true; // Make it loop
		this.music.play(); // Start the music
		
		if (!game.device.desktop) {
		this.addMobileInputs();
		}
		
		if (!game.device.dekstop) {
		// Call 'orientationChange' when the device is rotated
		game.scale.onOrientationChange.add(this.orientationChange, this);

		// Create an empty label to write the error message if needed
		this.rotateLabel = game.add.text(game.width/2, game.height/2, '',
		{ font: '30px Arial', fill: '#fff', backgroundColor: '#000' });
		this.rotateLabel.anchor.setTo(0.5, 0.5);

		// Call the function at least once
		this.orientationChange();
		}
    },
	
	addMobileInputs: function() {
    // Add the jump button
    var jumpButton = game.add.sprite(350, 240, 'jumpButton');
    jumpButton.inputEnabled = true;
    jumpButton.alpha = 0.5;
	jumpButton.events.onInputDown.add(this.jumpPlayer, this);

    // Add the move left button
    var leftButton = game.add.sprite(50, 240, 'leftButton');
    leftButton.inputEnabled = true;
    leftButton.alpha = 0.5;
	leftButton.events.onInputOver.add(this.setLeftTrue, this);
    leftButton.events.onInputOut.add(this.setLeftFalse, this);
    leftButton.events.onInputDown.add(this.setLeftTrue, this);
    leftButton.events.onInputUp.add(this.setLeftFalse, this);

    // Add the move right button
    var rightButton = game.add.sprite(130, 240, 'rightButton');
    rightButton.inputEnabled = true;
    rightButton.alpha = 0.5;
	rightButton.events.onInputOver.add(this.setRightTrue, this);
    rightButton.events.onInputOut.add(this.setRightFalse, this);
    rightButton.events.onInputDown.add(this.setRightTrue, this);
    rightButton.events.onInputUp.add(this.setRightFalse, this);
	
	// Call 'jumpPlayer' when the 'jumpButton' is pressed
	jumpButton.events.onInputDown.add(this.jumpPlayer, this);
	},
	
	setLeftTrue: function() {
    this.moveLeft = true;
	},
	
	setLeftFalse: function() {
    this.moveLeft = false;
	},
	
	setRightTrue: function() {
    this.moveRight = true;
	},
	
	setRightFalse: function() {
    this.moveRight = false;
	},
	
	jumpPlayer: function() {
		// If the player is touching the ground
		if (this.player.body.onFloor()) {
			// Jump with sound
			this.player.body.velocity.y = -320;
			this.jumpSound.play();
		}
	},
	
	gameTime: function()
	{
		this.gameClock.setText('Seconds Till Convention: ' + this.intTime);
		this.intTime--;
	},

    update: function() {
        // Replaced 'this.walls' by 'this.layer'
		game.physics.arcade.collide(this.player, this.layer);
		game.physics.arcade.collide(this.enemies, this.layer);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

        this.movePlayer(); 

        if (!this.player.inWorld) {
			this.playerDie();
        }
    },

    movePlayer: function() {
		// If 0 finger are touching the screen
		if (game.input.totalActivePointers == 0) {
		// Make sure the player is not moving
		this.moveLeft = false;
		this.moveRight = false;
		}
		if (this.cursor.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A) ||
		this.moveLeft) { // This is new
		this.player.body.velocity.x = -200;
		this.player.animations.play('left');
		}
        else if (this.cursor.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D) ||
		this.moveRight) { // This is new
		this.player.body.velocity.x = 200;
		this.player.animations.play('right');
		}
        else {
            this.player.body.velocity.x = 0;
			this.player.frame = 1;
        }
		if (this.cursor.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
        this.jumpPlayer();
		}	
    },

    takeCoin: function(player, coin) {
        game.global.score += 5;
        this.scoreLabel.text = 'Delegates: ' + game.global.score;
		
		// Scale the coin to 0 to make it invisible
		this.coin.scale.setTo(0, 0);
		// Grow the coin back to its original scale in 300ms
		game.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();
		
		game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();

		this.coinSound.play();

        this.updateCoinPosition();
    },

    updateCoinPosition: function() {
        var coinPosition = [
            {x: 150, y: 70}, {x: 370, y: 70}, 
            {x: 70, y: 150}, {x: 450, y: 150}, 
            {x: 140, y: 310}, {x: 380, y: 310} 
        ];

        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x == this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(coinPosition);
        this.coin.reset(newPosition.x, newPosition.y);
    },

    addEnemy: function() {
        var enemy = this.enemies.getFirstDead();

        if (!enemy) {
            return;
        }

        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
	
	createWorld: function() {
		// Create the tilemap
		this.map = game.add.tilemap('map2');

		// Add the tileset to the map
		this.map.addTilesetImage('tileset');

		// Create the layer by specifying the name of the Tiled layer
		this.layer = this.map.createLayer('Tile Layer 1');

		// Set the world size to match the size of the layer
		this.layer.resizeWorld();

		// Enable collisions for the first tilset element (the blue wall)
		this.map.setCollision(1);
	},
	
	orientationChange: function() {
		// If the game is in portrait (wrong orientation)
		if (game.scale.isPortrait) {
			// Pause the game and add a text explanation
			game.paused = true;
			this.rotateLabel.text = 'rotate your device in landscape';
		}
		// If the game is in landscape (good orientation)
		else {
			// Resume the game and remove the text
			game.paused = false;
			this.rotateLabel.text = '';
		}
	},
	
	startMenu: function() {
    game.state.start('menu');
	},

    playerDie: function() {
		// Kill the player to make it disappear from the screen
		this.player.kill();
		// Start the sound and the particles
		this.deadSound.play();
		// Set the position of the emitter on top of the player
		this.emitter.x = this.player.x;
		this.emitter.y = this.player.y;
		// Start the emitter by exploding 15 particles that will live 800ms
		this.emitter.start(true, 800, null, 15);
		this.music.stop();
		game.camera.flash(0xffffff, 300);
		game.camera.shake(0.02, 300);
		game.time.events.add(1000, this.startMenu, this);
		
    },
	
	gameEnd: function() {
		this.music.stop();
		this.victorySound.play();
		window.alert("Congratulations! You've beaten Hillary Clinton!")
		game.state.start('menu');
		
	},
};