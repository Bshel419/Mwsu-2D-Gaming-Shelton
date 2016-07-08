var loadState = {
    preload: function () {
        // Add a 'loading...' label on the screen
        var loadingLabel = game.add.text(game.width/2, 150, 'loading...', { font: '30px Arial', fill: '#ffffff' });
        loadingLabel.anchor.setTo(0.5, 0.5);
        // Display the progress bar
        var progressBar = game.add.sprite(game.width/2, 200, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);
        // Load all our assets
        game.load.spritesheet('player', 'assets/BERNIE_2.png', 30, 34, 3);
		game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);
        game.load.image('enemy', 'assets/HILLARY.png');
        game.load.image('coin', 'assets/Vote.png');
        // Load the tileset information
		game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.tilemap('map2', 'assets/map2.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tileset.png');
		
        // Load a new asset that we will use in the menu state
        game.load.image('background', 'assets/background.png');
		game.load.image('pixel', 'assets/pixel.png');
		game.load.image('jumpButton', 'assets/Up Arrow.png');
		game.load.image('rightButton', 'assets/Right Arrow.png');
		game.load.image('leftButton', 'assets/Left Arrow.png');
		
		// Sound when the player jumps
		game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
		// Sound when the player takes a coin
		game.load.audio('coin', ['assets/coin.ogg', 'assets/coin.mp3']);
		// Sound when the player dies
		game.load.audio('dead', ['assets/Bernie_end.ogg', 'assets/Bernie_end.mp3']);
		game.load.audio('victory', ['assets/Applause-SoundBible.com-151138312.mp3']);
		
		game.load.audio('music', ['assets/Hail to the Chief.ogg', 'assets/Hail to the Chief.mp3']);
		
		
		
		
    },
    create: function() {
        // Go to the menu state
        game.state.start('menu');
    }
};