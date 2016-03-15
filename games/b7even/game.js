JackDanger.b7even = function() {

};

//hier musst du deine Eintragungen vornhemen.
addMyGame("b7even", "Zombie Invasion", "b7even", "Töte die Zombies mit den Tasten!", "Bewegen", "Bombe legen", "Schlagen", JackDanger.b7even);

JackDanger.b7even.prototype.init = function() {
    logInfo("init Game");
    addLoadingScreen(this, false);//nicht anfassen
}

JackDanger.b7even.prototype.preload = function() {
	this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen
	
    //füge hie rein was du alles laden musst.
	game.load.spritesheet('jack', 'jack.png', 32, 64);
	game.load.spritesheet('zombie', 'zombie.png', 32, 64);
	game.load.image('heart', 'heart.png');
	game.load.image('dirt', 'dirt.png');
	game.load.spritesheet('bomb', 'bomb.png', 17, 21);
	game.load.spritesheet('explosion', 'explosion.png', 38, 38);

	game.load.bitmapFont('carrier_command', 'carrier_command.png', 'carrier_command.xml');

	game.load.audio('ExplosionAudio', 'Explosion.wav');
	game.load.audio('HitAudio', 'Hit.wav');
	//game.load.audio('HurtAudio', 'Hurt.wav');

	game.load.audio('Step1', 'pl_step1.wav');
	game.load.audio('Step2', 'pl_step2.wav');
}

//wird nach dem laden gestartet
JackDanger.b7even.prototype.create = function () {
    Pad.init();//nicht anfassen
    //removeLoadingScreen();//nicht anfassen
}

JackDanger.b7even.prototype.mycreate = function () {
    this.stepSound = [];

    this.stepSound[0] = game.add.audio('Step1');
    this.stepSound[0].volume -= .5
    this.stepSound[1] = game.add.audio('Step2');
    this.stepSound[1].volume -= .5
    this.stepTimer = 0;

    // create background
    for (var y = 0; y < 450; y += 64) {
        for (var x = 0; x < 800; x += 64) {
            var bg_element = game.add.sprite(32, 32, 'dirt');
            bg_element.scale.setTo(2, 2);

            bg_element.anchor.setTo(0.5, 0.5);

            bg_element.x = x + 32;
            bg_element.y = y + 32;

            bg_element.angle = Math.round(Math.random() * 3) * 90;
        }
    }

    this.statusMsgShadow = game.add.bitmapText(786 + 3, 424 + 3, 'carrier_command', '', 16);
    this.statusMsgShadow.anchor.setTo(1, .5);
    this.statusMsgShadow.tint = 0x000000;
    this.statusMsgShadow.alpha = .3;

    this.statusMsg = game.add.bitmapText(786, 424, 'carrier_command', '', 16);
    this.statusMsg.anchor.setTo(1, .5);
    this.statusMsg.tint = 0xa02d2d;

    // create jack
    this.jack = new this.jackDefinition();
    this.jack.create();

    // create zombies
    this.zombies = new this.zombiesDefinition();
    this.zombieT = new Date().getTime();

    this.zombieSpawner = [1000, 4000, 4000, 0, 4000, 250, 250, 250, 6000, 2000, 1000, 3000, 3000, 0, 2000, 0, 0, 2000, 2000, 0];

    this.zombies.count = this.zombieSpawner.length;

    this.statusMsg.setText(this.zombies.count + ' zombies left');
    this.statusMsgShadow.setText(this.zombies.count + ' zombies left');

    this.bombImage = game.add.sprite(770, 21, 'bomb');
    this.bombImage.anchor.setTo(0.5, .5);
    this.bombImage.scale.setTo(2.5, 2.5);

    this.bombMsgShadow = game.add.bitmapText(755 + 3, 30 + 3, 'carrier_command', '', 24);
    this.bombMsgShadow.anchor.setTo(1, .5);
    this.bombMsgShadow.tint = 0x000000;
    this.bombMsgShadow.alpha = .3;

    this.bombMsg = game.add.bitmapText(755, 30, 'carrier_command', '', 24);
    this.bombMsg.anchor.setTo(1, .5);
    this.bombMsg.tint = 0xa02d2d;

    this.bombCount = 2;

    this.bombMsg.setText(this.bombCount);
    this.bombMsgShadow.setText(this.bombCount);

    this.bombs = [];

    this.explosions = [];
}

//wird jeden Frame aufgerufen
JackDanger.b7even.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    // add zombie
    var timestamp = new Date().getTime();
    if (this.zombieT + this.zombieSpawner[0] <= timestamp && this.zombieSpawner.length > 0) {
        this.zombieSpawner.shift();
        
        this.zombieT = timestamp;
        this.zombies.add();
    }

    // bomb explode?
    for (var i in this.bombs) {
        if (this.bombs[i].timestamp + 2000 <= timestamp) {
            var audio = game.add.audio('ExplosionAudio');
            audio.play();

            var b = this.explosions.length;

            this.explosions[b] = {};

            this.explosions[b].obj = game.add.sprite(this.bombs[i].obj.x, this.bombs[i].obj.y, 'explosion');
            this.explosions[b].obj.anchor.setTo(.5, .5);
            this.explosions[b].obj.scale.setTo(6, 6);

            this.explosions[b].obj.animations.add('explode', [0, 1, 2, 3, 4, 5], 6, false);

            this.explosions[b].timestamp = timestamp;

            this.explosions[b].obj.animations.play('explode');

            game.world.remove(this.bombs[i].obj);
            this.bombs.splice(i, 1);

            // jack to near?
            var vx = this.explosions[b].obj.x - this.jack.obj.x;
            var vy = this.explosions[b].obj.y - this.jack.obj.y;

            var distance = Math.sqrt(vx * vx + vy * vy);

            if (distance <= 120) {
                this.jack.hit();
            }
        }
    }

    for (var i in this.explosions) {
        if (this.explosions[i].timestamp + 1000 <= timestamp) {
            game.world.remove(this.explosions[i].obj);
            this.explosions.splice(i, 1);
        } else if (this.explosions[i].timestamp + 250 <= timestamp && this.explosions[i].timestamp + 750 >= timestamp) {
            this.zombies.kill(this.explosions[i].obj.x, this.explosions[i].obj.y, 'Explosion');

            this.statusMsg.setText(this.zombies.count + ' zombies left');
            this.statusMsgShadow.setText(this.zombies.count + ' zombies left');
        }
    }

    // won?
    if (this.zombieSpawner.length == 0 && this.zombies.objects.length == 0) {
        onVictory();
    }

    // user input
    this.controls(dt);

    // jack animation
    this.jack.update(dt);

    // zombie ki and animation
    this.zombies.update(this.jack.obj.x, this.jack.obj.y, dt);

    // check if zombie hits jack
    for (var i in this.zombies.objects) {
        var vx = this.jack.obj.x - this.zombies.objects[i].x;
        var vy = this.jack.obj.y - this.zombies.objects[i].y;

        var distance = Math.sqrt(vx * vx + vy * vy);

        if (distance <= 25) {   // radius 40 == hit
            this.jack.hit();
        }
    }

    // arange objects behind each other
    var objects = [];

    for (var i in this.zombies.objects) {
        objects.push(this.zombies.objects[i]);
    }

    for (var i in this.bombs) {
        objects.push(this.bombs[i].obj);
    }

    objects.sort(function (a, b) { return a.y - b.y });

    var jack_top = false;

    for (var i in objects) {
        if (objects[i].y < this.jack.obj.y) {
            objects[i].bringToTop();
        } else {
            if (jack_top == false) {
                this.jack.obj.bringToTop();
                jack_top = true;
            }
            objects[i].bringToTop();
        }      
    }

    if (jack_top == false) {
        this.jack.obj.bringToTop();
    }

    for (var i in this.jack.lifes) {
        this.jack.lifes[i].bringToTop();
    }

    this.explosions.sort(function (a, b) { return a.obj.y - b.obj.y });
    for (var i in this.explosions) {
        this.explosions[i].obj.bringToTop();
    }

    game.world.bringToTop(this.statusMsgShadow);
    game.world.bringToTop(this.statusMsg);

    game.world.bringToTop(this.bombMsgShadow);
    game.world.bringToTop(this.bombMsg);
    game.world.bringToTop(this.bombImage);
}

// ---- //

// player
JackDanger.b7even.prototype.jackDefinition = function () {
    // definition
    this.obj;

    this.lifes = [];

    this.speed = 140;
    this.moving = false;
    this.direction = 'Down';

    this.lastHit = 0;
    this.gotHit = false;

    this.lastStrike = 0;
    this.lastBomb = 0;

    // create jack
    this.create = function () {
        // image
        this.obj = game.add.sprite(32, 64, 'jack');
        this.obj.anchor.setTo(0.5, 1);
        this.obj.scale.setTo(2, 2);

        this.obj.x = 400;
        this.obj.y = 289;

        // animation
        this.obj.animations.add('wDown', [1, 0, 1, 2], 6, true);
        this.obj.animations.add('wUp', [4, 3, 4, 5], 6, true);
        this.obj.animations.add('wLeft', [13, 12, 13, 14], 6, true);
        this.obj.animations.add('wRight', [10, 9, 10, 11], 6, true);
        this.obj.animations.add('idleDown', [1], 6, false);
        this.obj.animations.add('idleUp', [4], 6, false);
        this.obj.animations.add('idleLeft', [13], 6, false);
        this.obj.animations.add('idleRight', [10], 6, false);
        this.obj.animations.add('blink', [7, 8, 1], 6, false);
        this.obj.animations.add('talk', [6, 1], 6, true);
        this.obj.animations.add('hitRight', [15, 16, 10], 6, false);
        this.obj.animations.add('hitLeft', [18, 17, 13], 6, false);
        this.obj.animations.add('hitDown', [20, 19, 1], 6, false);
        this.obj.animations.add('hitUp', [21, 22, 4], 6, false);

        // start idle
        this.obj.animations.play('idleDown');

        // add lifes
        for (var i = 0; i < 3; i++) {
            this.addLife();
        }
    };

    this.addLife = function () {
        var i = this.lifes.length;

        this.lifes[i] = game.add.sprite(14, 12, 'heart');
        this.lifes[i].scale.setTo(2.5, 2.5);
        this.lifes[i].x = 15 + i * 40;
    }

    this.hit = function () {
        var timestamp = new Date().getTime();

        if (timestamp - this.lastHit > 1500) {
            this.gotHit = true;

            var audio = game.add.audio('HurtAudio');
            audio.play();

            // remove life
            game.world.remove(this.lifes[this.lifes.length - 1]);
            this.lifes.pop();

            this.lastHit = timestamp;
        }
    };

    this.update = function (dt) {
        // check if dead
        if (this.lifes.length == 0) {
            onLose();
        }

        // blink randomly in idle
        var timestamp = new Date().getTime();
        if (this.lastStrike + 350 < timestamp) {
            if (this.moving == false && this.direction == 'Down' && Math.random() < dt) {
                this.obj.animations.play('blink');
            }
        }

        // hit animation
        if (this.gotHit == true) {
            var timestamp = new Date().getTime();

            this.speed = 200;

            this.obj.alpha = Math.abs(Math.sin((timestamp - this.lastHit) / 600 * Math.PI));

            if (timestamp - this.lastHit >= 1500) {
                this.gotHit = false;

                this.speed = 140;

                this.obj.alpha = 1;
            }
        }
    };
}

JackDanger.b7even.prototype.zombiesDefinition = function () {
    this.objects = [];
    this.count;

    this.add = function () {
        var i = this.objects.length;

        this.objects[i] = game.add.sprite(32, 64, 'zombie');
        this.objects[i].scale.setTo(2, 2);

        this.objects[i].anchor.setTo(0.5, 1);

        this.objects[i].animations.add('wRight', [0, 1, 0, 2], 6, true);
        this.objects[i].animations.add('wLeft', [3, 4, 3, 5], 6, true);

        this.objects[i].speed = Math.random() * ((100) - 50) + 50;

        if (Math.random() > .5) {
            this.objects[i].x = 832;
        } else {
            this.objects[i].x = -32;
        }

        this.objects[i].y = Math.random() * (442 - 136) + 136;
    };

    this.kill = function (x, y, direction) {
        if (direction == 'Explosion') {
            for (var i in this.objects) {
                var vx = x - this.objects[i].x;
                var vy = y - this.objects[i].y;

                var distance = Math.sqrt(vx * vx + vy * vy);

                if (distance <= 120) {
                    game.world.remove(this.objects[i]);
                    this.objects.splice(i, 1);
                    this.count -= 1;
                    var audio = game.add.audio('HitAudio');
                    audio.play();
                }
            }
        } else if (direction == 'Left') {
            for (var i in this.objects) {
                if (Math.abs(this.objects[i].y - y) < 25) {
                    if (x - Math.abs(this.objects[i].x) > 0 && x - Math.abs(this.objects[i].x) < 40) {
                        game.world.remove(this.objects[i]);
                        this.objects.splice(i, 1);
                        this.count -= 1;
                        var audio = game.add.audio('HitAudio');
                        audio.play();
                    }
                }
            }
        } else if (direction == 'Right') {
            for (var i in this.objects) {
                if (Math.abs(this.objects[i].y - y) < 25) {
                    if (Math.abs(this.objects[i].x) - x > 0 && Math.abs(this.objects[i].x) - x < 40) {
                        game.world.remove(this.objects[i]);
                        this.objects.splice(i, 1);
                        this.count -= 1;
                        var audio = game.add.audio('HitAudio');
                        audio.play();
                    }
                }
            }
        } else if (direction == 'Up') {
            for (var i in this.objects) {
                if (Math.abs(this.objects[i].x - x) < 25) {
                    if (y - Math.abs(this.objects[i].y) > 0 && y - Math.abs(this.objects[i].y) < 40) {
                        game.world.remove(this.objects[i]);
                        this.objects.splice(i, 1);
                        this.count -= 1;
                        var audio = game.add.audio('HitAudio');
                        audio.play();
                    }
                }
            }
        } else if (direction == 'Down') {
            for (var i in this.objects) {
                if (Math.abs(this.objects[i].x - x) < 25) {
                    if (Math.abs(this.objects[i].y) - y > 0 && Math.abs(this.objects[i].y) - y < 40) {
                        game.world.remove(this.objects[i]);
                        this.objects.splice(i, 1);
                        this.count -= 1;
                        var audio = game.add.audio('HitAudio');
                        audio.play();
                    }
                }
            }
        }
    };

    this.update = function (x, y, dt) {
        for (var i in this.objects) {
            // steer to jack
            var vx = x - this.objects[i].x;
            var vy = y - this.objects[i].y;

            var len = Math.sqrt(vx * vx + vy * vy);

            var steerVectorX = vx / len;
            var steerVectorY = vy / len;

            // seperation
            var count = 0;
            var sepVectorX = 0;
            var sepVectorY = 0;

            for (var j in this.objects) {
                if (j != i) {
                    var xs = this.objects[j].x - this.objects[i].x;
                    var ys = this.objects[j].y - this.objects[i].y;

                    var distance = Math.sqrt(xs * xs + ys * ys);

                    if (distance <= 200) {
                        count += 1;

                        var vx = this.objects[j].x - this.objects[i].x;
                        var vy = this.objects[j].y - this.objects[i].y;

                        var len = Math.sqrt(vx * vx + vy * vy);

                        vx /= len;
                        vy /= len;

                        sepVectorX += (-vx) / len;
                        sepVectorY += (-vy) / len;
                    }
                }
            }

            if (count > 0) {
                sepVectorX /= count;
                sepVectorY /= count;
            }

            sepVectorX *= 50;
            sepVectorY *= 50;

            var vx = sepVectorX + steerVectorX;
            var vy = sepVectorY + steerVectorY;

            var len = Math.sqrt(vx * vx + vy * vy);

            vx /= len;
            vy /= len;

            this.objects[i].x += vx * this.objects[i].speed * dt;
            this.objects[i].y += vy * this.objects[i].speed * dt;

            // play animation
            if (vx > 0) {
                this.objects[i].animations.play('wRight');
            } else {
                this.objects[i].animations.play('wLeft');
            }
        }
    };
}

JackDanger.b7even.prototype.controls = function (dt) {
    var timestamp = new Date().getTime();

    // hit zombies
    if (Pad.isDown(Pad.SHOOT)) {
        if (this.jack.lastStrike + 350 < timestamp) {
            this.zombies.kill(this.jack.obj.x, this.jack.obj.y, this.jack.direction);

            this.statusMsg.setText(this.zombies.count + ' zombies left');
            this.statusMsgShadow.setText(this.zombies.count + ' zombies left');

            this.jack.obj.animations.play('hit' + this.jack.direction);

            this.jack.lastStrike = timestamp;
        }
    }

    // throw bomb
    if (Pad.isDown(Pad.JUMP)) {
        if (this.jack.lastBomb + 350 < timestamp && this.bombCount > 0) {
            
            this.bombCount -= 1;

            this.bombMsg.setText(this.bombCount);
            this.bombMsgShadow.setText(this.bombCount);

            // create bomb
            var i = this.bombs.length;

            this.bombs[i] = {};

            this.bombs[i].obj = game.add.sprite(this.jack.obj.x, this.jack.obj.y, 'bomb');
            this.bombs[i].obj.anchor.setTo(.5, 1);
            this.bombs[i].obj.scale.setTo(2, 2);

            this.bombs[i].obj.animations.add('explode', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 7, false);

            this.bombs[i].timestamp = timestamp;

            this.bombs[i].obj.animations.play('explode');

            this.jack.lastBomb = timestamp;
        }
    }

    var isMoved = false;
    var newDirection = false;

    if (this.jack.lastStrike + 350 < timestamp) {
        var f = 1;

        if ((Pad.isDown(Pad.LEFT) && (Pad.isDown(Pad.UP) || Pad.isDown(Pad.DOWN))) || (Pad.isDown(Pad.RIGHT) && (Pad.isDown(Pad.UP) || Pad.isDown(Pad.DOWN)))) {
            var f = .71;
        }

        if ((Pad.isDown(Pad.LEFT)) || (Pad.isDown(Pad.RIGHT)) || (Pad.isDown(Pad.UP)) || (Pad.isDown(Pad.DOWN))) {
            if (this.stepTimer + 350 < timestamp) {
                this.stepTimer = timestamp;
                this.stepSound[Math.round(Math.random())].play();
            }
        } 

        if (Pad.isDown(Pad.UP)) {
            this.jack.obj.y -= this.jack.speed * f * dt;
            isMoved = true;

            newDirection = 'Up';
        }

        if (Pad.isDown(Pad.DOWN)) {
            this.jack.obj.y += this.jack.speed * f * dt;
            isMoved = true;

            newDirection = 'Down';
        }

        if (Pad.isDown(Pad.LEFT)) {
            this.jack.obj.x -= this.jack.speed * f * dt;
            isMoved = true;

            newDirection = 'Left';
        }

        if (Pad.isDown(Pad.RIGHT)) {
            this.jack.obj.x += this.jack.speed * f * dt;
            isMoved = true;

            newDirection = 'Right';
        }
    } else {
        this.zombies.kill(this.jack.obj.x, this.jack.obj.y, this.jack.direction);

        this.statusMsg.setText(this.zombies.count + ' zombies left');
        this.statusMsgShadow.setText(this.zombies.count + ' zombies left');
    }

    if (this.jack.obj.x < 40) {
        this.jack.obj.x = 40;
    }

    if (this.jack.obj.x > 760) {
        this.jack.obj.x = 760;
    }

    if (this.jack.obj.y < 136) {
        this.jack.obj.y = 136;
    }

    if (this.jack.obj.y > 442) {
        this.jack.obj.y = 442;
    }

    if (this.jack.moving == false && isMoved == true) {
        // start moving
        this.jack.obj.animations.play('w' + this.jack.direction);
        this.jack.moving = true;
    } else if (this.jack.moving == true && isMoved == false) {
        // start idle
        if (this.jack.lastStrike + 350 < timestamp) {
            this.jack.obj.animations.play('idle' + this.jack.direction);
        }
        this.jack.moving = false;
    } else if (newDirection != false && newDirection != this.jack.direction) {
        // change direction
        this.jack.direction = newDirection;
        this.jack.obj.animations.play('w' + this.jack.direction);
    }
}
