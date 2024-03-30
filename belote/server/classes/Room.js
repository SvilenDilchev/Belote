
class Room{
    roomID = '';
    players = [];
    owner = null;

    constructor(roomID){
        this.roomID = roomID;
    }
    
    addPlayer(player){
        if(this.players.length < 4){
            this.players.push(player);
        }
    }

    removePlayer(player){
        if(player !== this.owner){
            this.players = this.players.filter(p => p.socketID !== player.socketID);
        }
        else{
            if(this.players.length > 1){
                this.players = this.players.filter(p => p.socketID !== player.socketID);
                this.owner = this.players[0];
            }else{
                this.players = [];
                this.owner = null;
            }
        }      
    }
}

module.exports = Room;