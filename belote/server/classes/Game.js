const Team = require('./Team');
const { cardLibrary } = require('../logic.js');
const { reset } = require('nodemon');

class Game {

    fullDeck = [];
    room = null;
    team1 = null;
    team2 = null;
    roundNumber = 0;
    roundBid = '';
    roundBidder = null;
    roundMultiplier = 1;
    lastRoundWasValat = false;

    hangingPoints = 0;

    constructor(room) {
        this.room = room;
    }

    setTeams() {

        const p1 = Math.floor(Math.random() * 4);
        do {
            var p2 = Math.floor(Math.random() * 4);
        }
        while (p2 === p1);
        do {
            var p3 = Math.floor(Math.random() * 4);
        }
        while (p3 === p1 || p3 === p2);
        const p4 = 6 - p1 - p2 - p3;

        this.team1 = new Team(this.room.players[p1], this.room.players[p3]);
        this.team1.teamID = 1;
        this.team2 = new Team(this.room.players[p2], this.room.players[p4]);
        this.team2.teamID = 2;

        this.setTurns();
    }

    resetTeamsAfterDealing() {
        // Map of socketID to player object for quick access
        const playersMap = {};
        this.room.players.forEach(player => {
            playersMap[player.socketID] = player;
        });

        // Reset team1 players
        this.team1.player1 = playersMap[this.team1.player1.socketID];
        this.team1.player2 = playersMap[this.team1.player2.socketID];

        // Reset team2 players
        this.team2.player1 = playersMap[this.team2.player1.socketID];
        this.team2.player2 = playersMap[this.team2.player2.socketID];
    }

    setTurns() {
        const p1 = Math.floor(Math.random() * 4);
        this.team1.player1.turn = p1;
        this.team2.player1.turn = (p1 + 1) % 4;
        this.team1.player2.turn = (p1 + 2) % 4;
        this.team2.player2.turn = (p1 + 3) % 4;
    }

    createDeck() {
        for (const suit of cardLibrary.suits) {
            for (const rank of cardLibrary.ranks) {
                this.fullDeck.push(cardLibrary.createCard(rank, suit, false, false));
            }
        }
    }

    shuffleDeck() {
        this.fullDeck = cardLibrary.shuffleDeck(this.fullDeck);
    }

    clearDeck() {
        this.fullDeck = [];
    }

    resetDeck() {
        this.clearDeck();
        this.createDeck();
        this.shuffleDeck();
    }

    deal5Cards() {
        this.room.players.sort((a, b) => a.turn - b.turn); // Sorting players based on turn

        for (let i = 0; i < this.room.players.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.room.players[i].hand.push(this.fullDeck.pop()); // Deal 3 cards to each player
            }
        }
        for (let i = 0; i < this.room.players.length; i++) {
            for (let j = 0; j < 2; j++) {
                this.room.players[i].hand.push(this.fullDeck.pop()); // Deal 3 cards to each player
            }
            cardLibrary.sortDeckBySuits(this.room.players[i].hand);
            this.room.players[i].hand = cardLibrary.sortDeckByPokerOrder(this.room.players[i].hand);
        }
        this.resetTeamsAfterDealing();
    }

    deal3Cards() {
        this.room.players.sort((a, b) => a.turn - b.turn); // Sorting players based on turn

        for (let i = 0; i < this.room.players.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.room.players[i].hand.push(this.fullDeck.pop()); // Deal 3 cards to each player
            }
            cardLibrary.sortDeckBySuits(this.room.players[i].hand);
            this.room.players[i].hand = cardLibrary.sortDeckByPokerOrder(this.room.players[i].hand);
        }

        this.resetTeamsAfterDealing();
    }

    incrementRoundNumber() {
        this.roundNumber++;
    }

    rotatePlayersAndClearHands() {
        this.room.players.sort((a, b) => a.turn - b.turn); // Sorting players based on turn

        for (let i = 0; i < this.room.players.length; i++) {
            this.room.players[i].hand = [];
        }

        this.room.players[0].turn = 3;
        this.room.players[1].turn = 0;
        this.room.players[2].turn = 1;
        this.room.players[3].turn = 2;

        this.resetTeamsAfterDealing();
    }

    getTeammate(player) {
        if (this.team1.player1.socketID === player.socketID) {
            return this.team1.player2;
        } else if (this.team1.player2.socketID === player.socketID) {
            return this.team1.player1;
        } else if (this.team2.player1.socketID === player.socketID) {
            return this.team2.player2;
        } else if (this.team2.player2.socketID === player.socketID) {
            return this.team2.player1;
        } else {
            // Player not found in any team
            return null;
        }
    }
}

module.exports = Game;