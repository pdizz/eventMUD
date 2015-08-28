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
                player.socket.to(player.room.id).emit('message', player.character.name + ' says "' + message + '"');
                player.socket.emit('message', 'You say "' + message + '"');
                break;

            case 'look':
                player.socket.to(player.room.id).emit('message', player.character.name + ' appears to be looking for something.');
                player.socket.emit('message', 'You look around.');
                player.socket.emit('message', player.room.description);
                break;

            default:
                player.socket.emit('message', 'Invalid command!');
        }
    };
}

module.exports = GamePlay;
