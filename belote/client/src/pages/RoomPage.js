import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";
import PlayerList from "../components/PlayerList";
import Game from "../components/Game";
import "../css/RoomPage.css";

export default function RoomPage({ rooms, setRooms }) {
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

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  const handleGameData = (gameData) => {
    setGame(gameData);
  };

  useEffect(() => {
    socket.on("print", (data) => {
        console.log(data);
        }
    )});

  useEffect(() => {
    socket.on("receiveGameData", handleGameData);
    socket.on("setup_game", handleStartGame);

    return () => {
      socket.off("receiveGameData", handleGameData);
      socket.off("setup_game", handleStartGame);
    };
  }, [socket]);

  useEffect(() => {
    const roomFromMap = rooms.get(location.state.roomID);
    if (roomFromMap) {
      setRoom(roomFromMap);
      setPlayers(roomFromMap.players);
    } else {
      navigate("/"); // Redirect to home page if room is not found
    }
  }, [rooms, location.state.roomID, navigate]);

  useEffect(() => {
    const handleUpdatePlayers = (newPlayers) => {
      setRoom(rooms.get(location.state.roomID));
      setPlayers(newPlayers);
      if (newPlayers.length === 0) {
        setIsGameStarted(false);
        setRooms(new Map(rooms).delete(location.state.roomID));
      }

      setCanStartGame(
        newPlayers.length === 4 &&
          rooms.get(location.state.roomID).owner.socketID === socket.id
      );
    };

    socket.on("update_players", handleUpdatePlayers);

    return () => {
      socket.off("update_players", handleUpdatePlayers);
    };
  }, [socket, location.state.roomID, rooms, setRooms]);

  useEffect(() => {
    const handleUpdateRoom = (newRoom) => {
      if (newRoom.players.length === 0) {
        setRooms((prevRooms) => new Map(prevRooms).delete(newRoom.roomID));
        navigate("/");
      }
      setRoom(newRoom);
      setRooms((prevRooms) => new Map(prevRooms).set(newRoom.roomID, newRoom));
    };

    socket.on("update_room", handleUpdateRoom);

    return () => {
      socket.off("update_room", handleUpdateRoom);
    };
  }, [socket, setRooms, rooms, navigate]);

  useEffect(() => {
    const handleResetGame = (gameData) => {
      setGame(gameData);
    };
  
    socket.on('reset_game', handleResetGame);
  
    return () => {
      socket.off('reset_game', handleResetGame);
    };
  }, [socket]);
  

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
