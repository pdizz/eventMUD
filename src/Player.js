function Player(socket, events) {
    var me = this;

    this.socket    = socket;
    this.events    = events;
    this.state     = null;
    this.character = null;

    this.setCharacter = function (character) {
        this.character = character;

        // Listen to character events
        this.events.on(this.character.id, function (message) {
            me.socket.emit('message', message);
        });
    };
}

module.exports = Player;