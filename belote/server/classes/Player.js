
class Player{
    socketID = null;
    name = null;
    roomID = null;
    isInGame = false;
    deck = [];

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