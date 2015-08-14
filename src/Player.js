function Player(socket) {
    var me = this;

    this.socket    = socket;
    this.character = {};

    this.socket.on('message', function(msg){
        console.log(msg);
    });
}

module.exports = Player;