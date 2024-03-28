
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
}

module.exports = Room;