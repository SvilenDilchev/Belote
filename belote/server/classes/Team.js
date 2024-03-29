
class Team{
    
    player1 = null; 
    player2 = null;

    totalPoints = 0;
    roundPoints = 0;

    constructor(player1, player2){
        this.player1 = player1;
        this.player2 = player2;
    }
}

module.exports = Team;