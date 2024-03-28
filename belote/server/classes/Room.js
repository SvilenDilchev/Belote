
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
            console.log("player is not owner");
            this.players = this.players.filter(p => p.socketID !== player.socketID);
        }
        else{
            if(this.players.length > 1){
                this.players = this.players.filter(p => p.socketID !== player.socketID);
                this.owner = this.players[0];
                this.owner.makeOwner();
                console.log("new owner: ", this.players[0])
            }else{
                console.log("room is empty");
                this.players = [];
                this.owner = null;
            }
            player.isRoomOwner = false;
        }      
    }
}

module.exports = Room;