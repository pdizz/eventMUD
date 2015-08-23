function Character() {
    this.name      = null;
    this.race      = null;
    this.abilities = {};

    // 1(-5), 2(-4), 3(-4), 4(-3), 5(-3), 6(-2), 7(-2) http://www.d20srd.org/srd/theBasics.htm#abilityScores
    var getModifier = function (ability) {
        var mod = -5;
        for (var i = 0; i < ability; i++) {
            if (i % 2 === 1) {
                mod++
            }
        }
        return mod;
    }
}

module.exports = Character;
