import { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";
import PlayerList from "../components/PlayerList";
import '../css/RoomPage.css';

export default function RoomPage({ rooms, setRooms }) {
    const location = useLocation();
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isGameStarted, setIsGameStarted] = useState(false);

    const startGame = () => {
        socket.emit('start_game');
        handleStartGame();
    }

    const handleStartGame = () => {
        console.log("received setup_game")
        setIsGameStarted(true);
    };

    useEffect(() => {
        socket.on('setup_game', handleStartGame);

        return () => {
            socket.off('setup_game', handleStartGame);
        };
    }, [socket]);

    useEffect(() => {
        const roomFromMap = rooms.get(location.state.roomID);
        if (roomFromMap) {
            setRoom(roomFromMap);
            setPlayers(roomFromMap.players);
        } else {
            navigate('/'); // Redirect to home page if room is not found
        }
    }, [rooms, location.state.roomID, navigate]);

    useEffect(() => {
        const handleUpdatePlayers = (newPlayers) => {
            setRoom(rooms.get(location.state.roomID));
            setPlayers(newPlayers);
        };

        socket.on('update_players', handleUpdatePlayers);

        return () => {
            socket.off('update_players', handleUpdatePlayers);
        };
    }, [socket]);

    if (!room) {
        return <div>Loading...</div>;
    }

    return (
        (!isGameStarted) ? (
            <div className="OuterContainer">
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
                        <div className={`StartGameLabel ${(players.length === 4 && rooms.get(location.state.roomID).owner.socketID === socket.id) ? 'active' : ''}`}>
                            Start Game
                        </div>
                        <div className={`StartGameButton ${(players.length === 4 && rooms.get(location.state.roomID).owner.socketID === socket.id) ? 'active' : ''}`} onClick={startGame}></div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="Game"></div>
        )
    );
}
