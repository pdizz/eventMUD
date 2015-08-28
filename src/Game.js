var Player = require(__dirname + '/Player.js');
var Character = require(__dirname + '/Character.js');
var GamePlay = require(__dirname + '/States/GamePlay.js');
var CreateCharacter = require(__dirname + '/States/CreateCharacter.js');

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

        socket.on('disconnect', function(){
            me.players.splice(me.players.indexOf(player));
            console.log(socket.id + ' disconnected');
        });

        // Init default state
        player.state = new CreateCharacter(player, me).init();
    });
}

Game.prototype.start = function () {
    this.http.listen(3000, function(){
        console.log('listening on *:3000');
    });
};

module.exports = Game;
