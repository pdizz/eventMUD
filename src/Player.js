function Player(socket) {
    this.socket    = socket;
    this.state     = null;
    this.character = {};
}

module.exports = Player;