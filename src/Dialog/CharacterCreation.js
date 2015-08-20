var async = require('async');
var Character = require(__dirname + '/../Character.js');

function CharacterCreation(player) {
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

    var character  = new Character();
    character.name = '';

    var askName = function (callback) {
        async.until(
            function () { return validName.test(character.name); },
            function (callback) {
                player.socket.emit('message', 'What is your name?');
                player.socket.once('message', function (data) {
                    if (validName.test(data)) {
                        character.name = data;
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
        async.until(
            function () { return validRaces.indexOf(character.race) > -1; },
            function (callback) {
                player.socket.emit('message', 'What is your race? (' + validRaces.join(', ') + ')');
                player.socket.once('message', function (data) {
                    if (validRaces.indexOf(data) > -1) {
                        character.race = data;
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

    this.create = function () {
        async.series(
            [askName, askRace],
            function (error, results) {
                player.character = character;
                player.socket.emit('message', 'Welcome, ' + character.race + ' ' + character.name + '!');
            }
        );
    };
}

module.exports = CharacterCreation;
