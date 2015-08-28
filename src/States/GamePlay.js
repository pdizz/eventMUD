function GamePlay(player, game) {

    this.init = function () {
        player.socket.addListener('message', parseCommand);
    };

    this.exit = function () {
        player.socket.removeListener('message', parseCommand);
    };

    var parseCommand = function (command) {
        var words = command.split(' ');

        switch (words[0].toLowerCase()) {
            case 'say':
                var message = words.slice(1).join(' ');
                player.socket.to(player.room).emit('message', player.socket.id + ' says "' + message + '"');
                player.socket.emit('message', 'You say "' + message + '"');
                break;

            default:
                player.socket.emit('message', 'Invalid command!');
        }
    };
}

module.exports = GamePlay;
