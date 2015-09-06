var async = require('async');
var Character = require(__dirname + '/../Character.js');
var GamePlay = require(__dirname + '/GamePlay.js');
var Room = require(__dirname + '/../Room.js');

function CreateCharacter(player, game) {
    var me = this;

    this.init = function () {
        var validName  = /^[A-Za-z\u00C0-\u017F]+$/;
        var validRaces = [
            'Dwarf',
            'Elf',
            'Gnome',
            'Half Elf',
            'Half Orc',
            'Halfling',
            'Human'
        ];
        // Roll 4 d6, keep the best three
        var rollStrategy = '4d6b3';

        var askName = function (callback) {
            var valid = false;

            async.until(
                function () { return valid; },
                function (callback) {
                    player.socket.emit('message', 'What is your name?');

                    player.socket.once('message', function (data) {
                        if (validName.test(data)) {
                            character.name = data;
                            valid = true;
                        } else {
                            player.socket.emit('message', data + ' is not a valid name!');
                        }

                        callback();
                    });
                },
                function (err) {
                    callback(null, character.name);
                }
            );
        };

        var askRace = function (callback) {
            var valid = false;

            async.until(
                function () { return valid; },
                function (callback) {
                    player.socket.emit('message', 'What is your race? (' + validRaces.join(', ') + ')');

                    player.socket.once('message', function (data) {
                        if (validRaces.indexOf(data) > -1) {
                            character.race = data;
                            valid = true;
                        } else {
                            player.socket.emit('message', data + ' is not a valid race!');
                        }

                        callback();
                    });
                },
                function (err) {
                    callback(null, character.race);
                }
            );
        };

        var rollStats = function (callback) {
            var accepted  = false;
            var abilities = {
                str: 0,
                dex: 0,
                con: 0,
                int: 0,
                wis: 0,
                cha: 0
            };

            async.until(
                function () { return accepted; },
                function (callback) {
                    player.socket.emit('message', 'Rolling your character...');

                    // Roll each stat
                    var total = 0;
                    Object.keys(abilities).map(function (key) {
                        var roll       = game.dice.roll(rollStrategy);
                        abilities[key] = roll.result;
                        total         += roll.result;

                        player.socket.emit('message', key + ': ' + roll.result + ' (' + roll.rolled.join(', ') + ')');
                    });
                    player.socket.emit('message', '\ntot: ' + total);
                    player.socket.emit('message', 'Is this acceptable? (y/n)');

                    player.socket.once('message', function (data) {
                        if (data === 'y') {
                            character.abilities = abilities;
                            accepted = true;
                        }

                        callback();
                    });
                },
                function (err) {
                    callback(null, character.stats);
                }
            );
        };

        var character  = new Character(game.uuid.v4(), game.events);
        character.name = '';

        async.series(
            [
                askName,
                askRace,
                rollStats
            ],
            function (error, results) {
                player.setCharacter(character);

                // TODO zone with starting room, not hard coded
                player.character.moveTo(new Room('default', 'It is a dark room with things and stuff.'));
                player.socket.emit('message', 'Welcome, ' + character.race + ' ' + character.name + '!');

                // Transition state
                me.exit();
            }
        );
    };

    this.exit = function () {
        // Transition back to game
        player.state = new GamePlay(player, game).init();
    };
}

module.exports = CreateCharacter;
