var Player = require(__dirname + '/Player.js');
var CharacterCreation = require(__dirname + '/Dialog/CharacterCreation.js');

function Game(io, http) {
    var me = this;

    this.io         = io;
    this.http       = http;
    this.players    = [];
    this.characters = [];

    this.io.on('connection', function(socket){
        console.log(socket.id + ' connected');

        var player = new Player(socket);
        me.players.push(player);

        var charCreation = new CharacterCreation(player);
        charCreation.create();

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
