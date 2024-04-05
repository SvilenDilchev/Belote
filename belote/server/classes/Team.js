
class Team{
    
    teamID = 0;

    player1 = null; 
    player2 = null;

    roundDeclarations = [];
    hasTakenHand = false;

    totalPoints = 0;
    roundPoints = 0;
    
    hasWon = false;

    constructor(player1, player2){
        this.player1 = player1;
        this.player2 = player2;
    }
}

module.exports = Team;