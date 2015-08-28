function Player(socket) {
    this.socket    = socket;
    this.state     = null;
    this.character = null;
    this.room      = null;
}

Player.prototype.moveTo = function (room) {
    // Leave current room
    if (this.room) {
        this.socket.leave(this.room.id);
    }

    // Join new room
    this.socket.join(room.id);
    this.room = room;
};

module.exports = Player;