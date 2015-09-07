var async = require('async');
var Player = require(__dirname + '/Player.js');
var Character = require(__dirname + '/Character.js');
var Room = require(__dirname + '/Room.js');
var StateMachine = require('javascript-state-machine');

function Game(io, http, events, uuid, dice) {
    var me = this;

    this.io         = io;
    this.http       = http;
    this.events     = events;
    this.uuid       = uuid;
    this.dice       = dice;
    this.players    = [];
    this.characters = [];

    this.io.on('connection', function(socket){
        console.log(socket.id + ' connected');

        var player = new Player(socket, events, uuid, dice);
        me.players.push(player);

        /**
         * State machine to manage player state transitions and turning on/off socket listeners
         */
        player.fsm = StateMachine.create({
            initial: 'intro',
            events:  [
                { name: 'createCharacter', from: 'intro',  to: 'dialog'},
                { name: 'enterWorld',      from: 'dialog', to: 'dialog'},
                { name: 'gamePlay',        from: 'dialog', to: 'play'}
            ],
            callbacks: {
                onintro: function () {
                    player.socket.emit('message', 'Welcome to eventMUD!');
                },

                // Remove commands listener when in dialog state
                ondialog: function () {
                    player.socket.removeListener('message', player.doCommand);
                },

                // Listen to commands again when in gameplay state
                onplay: function () {
                    player.socket.addListener('message', player.doCommand);
                },

                oncreateCharacter: me.createCharacter,

                onenterWorld: function () {
                    // TODO zone with starting room, not hard coded
                    player.character.moveTo(new Room('default', 'It is a dark room with things and stuff.'));

                    player.fsm.gamePlay();
                }
            }
        });
        player.fsm.createCharacter(player);

        socket.on('disconnect', function(){
            me.players.splice(me.players.indexOf(player));
            console.log(socket.id + ' disconnected');
        });
    });

    /**
     * Character creation dialog invoked by state machine
     * @param event
     * @param from
     * @param to
     * @param player
     */
    this.createCharacter = function(event, from, to, player) {
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
                        var roll       = player.dice.roll(rollStrategy);
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

        var character  = new Character(player.uuid.v4(), player.events);
        character.name = '';

        async.series(
            [
                askName,
                askRace,
                rollStats
            ],
            function (error, results) {
                player.setCharacter(character);
                player.socket.emit('message', 'Welcome, ' + character.race + ' ' + character.name + '!');

                player.fsm.enterWorld();
            }
        );
    };

}

Game.prototype.start = function () {
    this.http.listen(3000, function(){
        console.log('listening on *:3000');
    });
};

module.exports = Game;
