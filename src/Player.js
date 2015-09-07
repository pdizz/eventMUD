function Player(socket, events, uuid, dice) {
    var me = this;

    this.socket    = socket;
    this.events    = events;
    this.uuid      = uuid;
    this.dice      = dice;
    this.fsm       = null;
    this.character = null;

    /**
     * Set the character and begin listening to character events
     * @param character
     */
    this.setCharacter = function (character) {
        this.character = character;

        // Listen to character events
        this.events.on(this.character.id, function (message) {
            me.socket.emit('message', message);
        });
    };

    /**
     * Parse the player command and execute
     * @param command
     */
    this.doCommand = function (command) {
        var words = command.split(' ');
        var key = words[0].toLowerCase();
        switch (key) {
            case 'say':
            case 'speak':
                var message = words.slice(1).join(' ');
                var action = {name: 'say', actor: me.character, message: message};
                me.character.emitToRoom(action);
                me.socket.emit('message', 'You say "' + message + '"');
                break;

            case 'look':
                var action = {name: 'look', actor: me.character};
                me.character.emitToRoom(action);
                me.socket.emit('message', 'You look around.');
                me.socket.emit('message', player.character.room.description);
                break;

            default:
                me.socket.emit('message', 'Invalid command!');
        }
    }
}

module.exports = Player;