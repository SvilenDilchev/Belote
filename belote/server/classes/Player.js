
class Player{
    socketID = null;
    name = null;
    roomID = null;
    isInGame = false;
    isRoomOwner = false;

    constructor(socketID){
        this.socketID = socketID;
    }

    setName(name){
        this.name = name;
    }

    clearName(){
        this.name = null;
    }

    makeOwner(){
        this.isRoomOwner = true;
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