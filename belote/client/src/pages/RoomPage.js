import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";
import PlayerList from "../components/PlayerList";
import Game from "../components/Game";
import "../css/RoomPage.css";

export default function RoomPage() {
  const location = useLocation();
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [canStartGame, setCanStartGame] = useState(false);
  const [game, setGame] = useState(null);

  const startGame = () => {
    socket.emit("start_game", room);
  };

  useEffect(() => {
    const handleStartGame = () => {
      setIsGameStarted(true);
    };
  
    const handleGameData = (gameData) => {
      setGame(gameData);
    };
  
    const handleUpdateRoom = (newRoom) => {
      console.log("newRoom: ", newRoom)
      setRoom(newRoom);
      setPlayers(newRoom.players);
      setCanStartGame(
        newRoom.players.length === 4 &&
          newRoom.owner.socketID === socket.id
      );
    };
  
    const handleResetGame = (gameData) => {
      setGame(gameData);
    };
  
    const handleRoomEnded = () => {
      setIsGameStarted(false);
      navigate("/");
    }


    socket.on("receiveGameData", handleGameData);
    socket.on("setup_game", handleStartGame);
    socket.on("room_ended", handleRoomEnded);
    socket.on("update_room", handleUpdateRoom);
    socket.on('reset_game', handleResetGame);

    return () => {
      socket.off("receiveGameData", handleGameData);
      socket.off("setup_game", handleStartGame);
      socket.off("room_ended", handleRoomEnded);
      socket.off("update_room", handleUpdateRoom);
      socket.off('reset_game', handleResetGame);
    };
  }, [navigate, room, socket]);

  useEffect(() => {
    const stateRoom = location.state.room;
    if (stateRoom) {
      setRoom(stateRoom);
      setPlayers(stateRoom.players);
    } else {
      navigate("/"); 
    }
  }, [location.state.room, location.state.roomID, navigate]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return !isGameStarted ? (
    <div className="OuterContainer">
      <div className="ContainerWrapper">
        <div className="PageTitle"> BELOTE </div>
      </div>
      <div className="ContainerWrapper">
        <div className="RoomContainer">
          <div className="RoomBox">
            <p className="RoomLabel">Room</p>
            <p className="RoomID">{room.roomID}</p>
            <hr className="BreakLine" />
            <p className="RoomLabel">Players</p>
            <PlayerList className="PlayerList" players={players} />
          </div>
        </div>
      </div>
      <div className="ContainerWrapper">
        <div className="ButtonContainer">
          <div className={`StartGameLabel ${canStartGame ? "active" : ""}`}>
            Start Game
          </div>
          <div
            className={`StartGameButton ${canStartGame ? "active" : ""}`}
            onClick={canStartGame ? startGame : undefined}
          ></div>
        </div>
      </div>
    </div>
  ) : (
    <Game game={game} socket={socket} />
  );
}
