var mainState = {

    preload: function()
	{
		game.load.image('tiles', 'BasicTiles.png');
    },

    create: function()
	{
		this.graphics = game.add.graphics(0, 0);
		this.graphics.beginFill(0xffff00, 1);
        // Create the tilemap
		var mapResults = [];
		mapResults = this.mapGen(32, 32, 4, 8, 3000, this.rnd.realInRange(.25, .9));
		var data = this.makeCSV(mapResults[0], mapResults[1]);
		console.log(data);
		game.cache.addTilemap('dynamicMap', null, data, Phaser.Tilemap.CSV);
		this.map = game.add.tilemap('dynamicMap', 16, 16);
		this.map.addTilesetImage('tiles');
		this.layer = this.map.createLayer(0);
    },
	
	
	// mapGen() takes a floor size, minimum room size, maximum room size, and maximum number of failed attempts to add a room.
	// optional parameters include target fill percentage (stop generation when this is met or a number of attempts are failed.)
	
	mapGen: function(floorX, floorY, roomMin, roomMax, maxFails, fillPct = 100)
	{
		var level = new Array(floorX);
		for (var i = 0; i < floorX; i++)
		{
			level[i] = new Array(floorY);
		}
		for (var x = 0; x < floorX; x++)
		{
			for (var y = 0; y < floorY; y++)
			{
				level[x][y] =
				{
					region: 0,
					walls: 0x0
				}
			}
		}
		var failures = 0;
		var region = 1;
		var regions = [];
		var tiles = 0;
		var rooms = 0;
		var pathData = [];
		var room = new Phaser.Point(0,0);
		var origin = new Phaser.Point(0,0);
		do
		{
			room.x = Math.floor(Math.sqrt(this.rnd.integerInRange(roomMin*roomMin, (roomMax+1)*(roomMax+1))));
			room.y = Math.floor(Math.sqrt(this.rnd.integerInRange(roomMin*roomMin, (roomMax+1)*(roomMax+1))));
			origin.x = this.rnd.integerInRange(0, floorX - room.x);
			origin.y = this.rnd.integerInRange(0, floorY - room.y);
			if (this.validRoom(level, origin, room))
			{
				regions.push(region);
				for (var x = origin.x; x < origin.x + room.x; x++)
				{
					for (var y = origin.y; y < origin.y + room.y; y++)
					{
						
						level[x][y].region = region;
						if (x == origin.x)
						{
							level[x][y].walls += 8;
						}
						else if (x == origin.x + room.x - 1)
						{
							level[x][y].walls += 2;
						}
						if (y == origin.y)
						{
							level[x][y].walls += 1;
						}
						else if (y == origin.y + room.y - 1)
						{
							level[x][y].walls += 4;
						}
					}
				}
				region++;
				tiles += room.x * room.y;
			}
			else
			{
				failures++;
			}
			if (tiles / (floorX * floorY) > fillPct)
			{
				rooms = regions.length;
				pathData = this.pathGen(level, region, regions);
				region = pathData[0];
				regions = pathData[1];
				console.log(regions);
				this.doorGen(level, rooms, regions);
				this.trimPaths(level);
				return [level, rooms, regions];
			}
		}while(failures < maxFails);
		rooms = regions.length;
		pathData = this.pathGen(level, region, regions);
		region = pathData[0];
		regions = pathData[1];
		console.log(regions);
		this.doorGen(level, rooms, regions);
		this.trimPaths(level);
		return [level, rooms, regions];
	},
	
	pathGen: function(level, region, regions)
	{
		var origin = new Phaser.Point();
		while(this.emptyTiles(level))
		{
			do
			{
				origin.x = this.rnd.integerInRange(0, level.length - 1);
				origin.y = this.rnd.integerInRange(0, level[0].length - 1);
			}while (level[origin.x][origin.y].region != 0);
			regions.push(region);
			this.pathRecurse(level, region++, origin);
		}
		return [region, regions];
	},
	
	pathRecurse: function(level, region, curr, prev = 0)
	{
		level[curr.x][curr.y].region = region;
		var dirs = [1, 2, 4, 8];
		var i = 0;
		if (curr.x == 0)
		{
			i = dirs.indexOf(8);
			dirs.splice(i, 1);
			level[curr.x][curr.y].walls += 8;
		}
		else if (curr.x == level.length - 1)
		{
			i = dirs.indexOf(2);
			dirs.splice(i, 1);
			level[curr.x][curr.y].walls += 2;
		}
		if (curr.y == 0)
		{
			i = dirs.indexOf(1);
			dirs.splice(i, 1);
			level[curr.x][curr.y].walls += 1;
		}
		else if (curr.y == level[0].length - 1)
		{
			i = dirs.indexOf(4);
			dirs.splice(i, 1);
			level[curr.x][curr.y].walls += 4;
		}
		i = dirs.indexOf(prev);
		if (i > -1)
		{
			dirs.splice(i, 1);
		}
		var next = new Phaser.Point();
		while (dirs.length > 0)
		{
			next.x = curr.x;
			next.y = curr.y;
			var dir = this.rnd.pick(dirs);
			i = dirs.indexOf(dir);
			dirs.splice(i, 1);
			switch (dir)
			{
			case 1:
				next.y--;
				break;
			case 2:
				next.x++;
				break;
			case 4:
				next.y++;
				break;
			case 8:
				next.x--;
			}
			if (level[next.x][next.y].region == 0)
			{
				this.pathRecurse(level, region, next, dir < 4 ? dir * 4 : dir / 4)
			}
			else
			{
				level[curr.x][curr.y].walls += dir;
			}
		}	
	},
	
	doorGen: function(level, rooms, regions)
	{
		origin = new Phaser.Point();
		var connected = [];
		var borders = [];
		for (var x = 0; x < level.length; x++)
		{
			for (var y = 0; y < level[0].length; y++)
			{
				var twalls = [];
				if (x > 0 && level[x][y].region != level[x-1][y].region)
				{
					twalls.push(8);
				}
				if (x < level.length - 1 && level[x][y].region != level [x+1][y].region)
				{
					twalls.push(2);
				}
				if (y > 0 && level[x][y].region != level [x][y-1].region)
				{
					twalls.push(1);
				}
				if (y < level.length - 1 && level[x][y].region != level [x][y+1].region)
				{
					twalls.push(4);
				}
				twalls.sort();
				if (twalls.length != 0)
				{
					var tx = x;
					var ty = y;
					borders.push({x: tx, y: ty, walls: twalls});
				}
			}
		}
		var origin = this.rnd.pick(borders);
		connected.push(level[origin.x][origin.y].region)
		do
		{
			var target = new Phaser.Point(origin.x, origin.y);
			var dir = 0;
			var i = connected.indexOf(level[origin.x][origin.y].region);
			if (i > -1)
			{
				dir = game.rnd.pick(origin.walls);
				switch (dir)
				{
				case 1:
					target.y--;
					break;
				case 2:
					target.x++;
					break;
				case 4:
					target.y++;
					break;
				case 8:
					target.x--;
				}
				if (connected.indexOf(level[target.x][target.y].region) < 0)
				{
					connected.push(level[target.x][target.y].region);
					level[origin.x][origin.y].walls = level[origin.x][origin.y].walls & ~dir;
					level[target.x][target.y].walls = level[target.x][target.y].walls & ~(dir < 4 ? dir * 4 : dir / 4);
					var j = borders.indexOf(origin);
					borders.splice(j, 1);
				}
				else if (this.rnd.realInRange(0,1) > .5)
				{
					level[origin.x][origin.y].walls = level[origin.x][origin.y].walls & ~dir;
					level[target.x][target.y].walls = level[target.x][target.y].walls & ~(dir < 4 ? dir * 4 : dir / 4);
					var j = borders.indexOf(origin);
					borders.splice(j, 1);
				}
			}
			origin = this.rnd.pick(borders);
			console.log("waiting for final connection");
		}while (connected.length < regions.length);
	},
	
	trimPaths(level)
	{
		var deadEnds = [];
		for (var x = 0; x < level.length; x++)
		{
			for (var y = 0; y < level[0].length; y++)
			{
				switch (~level[x][y].walls & 0xf)
				{
				case 1:
				case 2:
				case 4:
				case 8:
					deadEnds.push(new Phaser.Point(x, y));
				}
			}
		}
		while (deadEnds.length > 0)
		{
			path = deadEnds.pop();
			switch (~level[path.x][path.y].walls & 0xf)
			{
			case 1:
				level[path.x][path.y - 1].walls += 4;
				switch (~level[path.x][path.y - 1].walls & 0xf)
				{
				case 1:
				case 2:
				case 4:
				case 8:
					deadEnds.push(new Phaser.Point(path.x, path.y - 1));
				}
				break;
			case 2:
				level[path.x + 1][path.y].walls += 8;
				switch (~level[path.x + 1][path.y].walls & 0xf)
				{
				case 1:
				case 2:
				case 4:
				case 8:
					deadEnds.push(new Phaser.Point(path.x + 1, path.y));
				}
				break;
			case 4:
				level[path.x][path.y + 1].walls += 1;
				switch (~level[path.x][path.y + 1].walls & 0xf)
				{
				case 1:
				case 2:
				case 4:
				case 8:
					deadEnds.push(new Phaser.Point(path.x, path.y + 1));
				}
				break;
			case 8:
				level[path.x - 1][path.y].walls += 2;
				switch (~level[path.x - 1][path.y].walls & 0xf)
				{
				case 1:
				case 2:
				case 4:
				case 8:
					deadEnds.push(new Phaser.Point(path.x - 1, path.y));
				}
			}
			level[path.x][path.y].walls = 0;
			level[path.x][path.y].region = 0;
		}
	},
	
	emptyTiles: function(level)
	{
		for (var x = 0; x < level.length; x++)
		{
			for (var y = 0; y < level[0].length; y++)
			{
				if (level[x][y].region == 0)
				{
					return true;
				}
			}
		}
		return false;
	},
	
	validRoom: function(level, origin, room)
	{
		for (var x = origin.x; x < origin.x + room.x; x++)
		{
			for (var y = origin.y; y < origin.y + room.y; y++)
			{
				if (level[x][y].region != 0)
				{
					return false;
				}
			}
		}
		return true;
	},
	
	makeCSV: function(level, rooms)
	{
		var levelCSV = '';

		for (var y = 0; y < level[0].length; y++)
		{
			for (var x = 0; x < level.length; x++)
			{
				levelCSV += level[x][y].region ? level[x][y].walls.toString() : '15';

				if (x < level.length)
				{
					levelCSV += ',';
				}
			}

			if (y < level[0].length)
			{
				levelCSV += "\n";
			}
		}
		
		return levelCSV;
	}
};

//start the game
var game = new Phaser.Game(512, 512, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');