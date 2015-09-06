function GamePlay(player, game) {

    this.init = function () {
        player.socket.addListener('message', parseCommand);
    };

    this.exit = function () {
        player.socket.removeListener('message', parseCommand);
    };

    var parseCommand = function (command) {
        var words  = command.split(' ');
        var key    = words[0].toLowerCase();
        switch (key) {
            case 'say':
            case 'speak':
                var message = words.slice(1).join(' ');
                var action = {name: 'say', actor: player.character, message: message};
                player.character.emitToRoom(action);
                player.socket.emit('message', 'You say "' + message + '"');
                break;

            case 'look':
                var action = {name: 'look', actor: player.character};
                player.character.emitToRoom(action);
                player.socket.emit('message', 'You look around.');
                player.socket.emit('message', player.character.room.description);
                break;

            default:
                player.socket.emit('message', 'Invalid command!');
        }
    };
}

module.exports = GamePlay;
