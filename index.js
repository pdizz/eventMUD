var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var events  = new (require('events').EventEmitter);
var uuid    = require('uuid');
var dice    = new (require('roll'))();
var Game    = require(__dirname + '/src/Game.js');

app.use(express.static(__dirname + '/public'));

var game = new Game(io, http, events, uuid, dice);
game.start();
