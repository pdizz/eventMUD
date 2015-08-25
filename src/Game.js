var Player = require(__dirname + '/Player.js');
var Character = require(__dirname + '/Character.js');
var CharacterCreation = require(__dirname + '/Dialog/CharacterCreation.js');

function Game(io, http, dice) {
    var me = this;

    this.io         = io;
    this.http       = http;
    this.dice       = dice;
    this.players    = [];
    this.characters = [];

    this.io.on('connection', function(socket){
        console.log(socket.id + ' connected');

        var player = new Player(socket);
        me.players.push(player);


        // TODO more rooms
        player.room = 'default';
        socket.join('default');

        // Commands
        socket.on('message', function (command) {
            var words = command.split(' ');
            switch (words[0].toLowerCase()) {
                case 'say':
                    var message = words.slice(1).join(' ');
                    socket.to(player.room).emit('message', player.socket.id + ' says "' + message + '"');
                    socket.emit('message', 'You say "' + message + '"');
                    break;
                default:
                    socket.emit('message', 'Invalid command!');
            }
        });

        socket.on('disconnect', function(){
            me.players.splice(me.players.indexOf(player));
            console.log(socket.id + ' disconnected');
        });
    });
}

Game.prototype.start = function () {
    this.http.listen(3000, function(){
        console.log('listening on *:3000');
    });
};

module.exports = Game;
