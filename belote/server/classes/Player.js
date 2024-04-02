
class Player{
    socketID = null;
    name = null;
    roomID = null;

    isInGame = false;
    hand = [];
    turn = 0;
    trickTurn = 0;

    constructor(socketID){
        this.socketID = socketID;
    }

    setName(name){
        this.name = name;
    }

    clearName(){
        this.name = null;
    }

    joinRoom(roomID){
        if(!this.roomID){
            this.roomID = roomID;
        }
    }
    
    leaveRoom(){
        this.roomID = null;
    }
}

module.exports = Player;