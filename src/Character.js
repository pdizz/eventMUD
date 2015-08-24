function Character() {
    this.name      = null;
    this.race      = null;
    this.abilities = {};

    // 1(-5), 2(-4), 3(-4), 4(-3), 5(-3), 6(-2), 7(-2) http://www.d20srd.org/srd/theBasics.htm#abilityScores
    var getModifier = function (ability) {
        return Math.floor(ability / 2) - 5;
    }
}

module.exports = Character;
