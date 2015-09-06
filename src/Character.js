function Character(id, events) {
    this.id        = id;
    this.events    = events;
    this.name      = null;
    this.race      = null;
    this.abilities = {};
    this.room      = {};

    this.reactions = {
        say: function (scope, action) {
            if (action.actor.id !== scope.id) {
                scope.emitToSelf(action.actor.name + ' says "' + action.message + '"');
            }
        },
        look: function (scope, action) {
            if (action.actor.id !== scope.id) {
                scope.emitToSelf(action.actor.name + ' appears to be looking for something.');
            }
        }
    };

    this.react = function (action) {
        var reaction = this.reactions[action.name];
        return reaction(this, action);
    };

    this.emitToRoom = function (action) {
        this.events.emit(this.room.id, action);
    };

    this.emitToSelf = function (action) {
        this.events.emit(this.id, action);
    };

    this.moveTo = function (room) {
        // Leave current room
        if (this.room) {
            this.events.removeListener(this.room.id, this.react);
        }

        // Join new room
        this.events.addListener(room.id, this.react.bind(this));
        this.room = room;
    };

    // 1(-5), 2(-4), 3(-4), 4(-3), 5(-3), 6(-2), 7(-2) http://www.d20srd.org/srd/theBasics.htm#abilityScores
    var getModifier = function (ability) {
        return Math.floor(ability / 2) - 5;
    }
}

module.exports = Character;
