var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require(__dirname + '/src/Game.js');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var game = new Game(io, http);
game.start();
