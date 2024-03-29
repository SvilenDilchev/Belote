const Team = require('./Team');

class Game {

    fullDeck = [];
    room = null;
    team1 = null;
    team2 = null;

    constructor(room) {
        this.room = room;
    }

    setTeams(){

        const p1 = Math.floor(Math.random() * 4);
        do
        {
            var p2 = Math.floor(Math.random() * 4);
        }
        while(p2 === p1);
        do
        {
            var p3 = Math.floor(Math.random() * 4);
        }
        while(p3 === p1 || p3 === p2);
        const p4 = 6 - p1 - p2 - p3;

        this.team1 = new Team(this.room.players[p1], this.room.players[p3]);
        this.team2 = new Team(this.room.players[p2], this.room.players[p4]);
    }
}

module.exports = Game;