import { useRef, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { SocketContext } from '../context/socket';

import '../App.css';
import '../css/HomePage.css';

export default function Home() {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [isRoomFull, setIsRoomFull] = useState(false);
    const socket = useContext(SocketContext);
    const navigate = useNavigate();
    const responseRef = useRef(null);

    const joinRoom = async () => {
        if (username.trim() !== '' && room.trim() !== '' && !isRoomFull) {
            socket.emit('join_room', { roomID: room, playerName: username });
        } else {
            handleRoomFull();
        }
    };

    const delay = useCallback((delayInms) => {
        return new Promise(resolve => setTimeout(resolve, delayInms));
    }, []);

    useEffect(() => {
        const handleSetRoom = (room) => {
            navigate(`/room/:${room.roomID}`, { state: { room: room, roomID: room.roomID, players: room.players } });
        };

        socket.on('set_room', handleSetRoom);

        return () => {
            socket.off('set_room', handleSetRoom);
        };
    }, [navigate, socket]);

    const handleRoomFull = useCallback(async () => {
        responseRef.current.innerText = 'Room is full, try another one!';
        setIsRoomFull(true);
        await delay(3000);
        setIsRoomFull(false);
    }, [responseRef, setIsRoomFull, delay]);

    useEffect(() => {

        socket.on('room_full', handleRoomFull);

        return () => {
            socket.off('room_full', handleRoomFull);
        };
    }, [socket, handleRoomFull]);

    return (
        <div className="Container">
            <div className='PageTitle'> BELOTE </div>
            <br />
            <input
                className='inputField'
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(event) => {
                    setUsername(event.target.value);
                }}
            />
            <br />
            <input
                className="inputField"
                type="text"
                placeholder="Enter a room code"
                value={room}
                onChange={(event) => {
                    setIsRoomFull(false);
                    setRoom(event.target.value);
                }}
            />
            <br />
            <button className='joinButton' onClick={joinRoom}>Join</button>
            <div className={`systemResponse ${isRoomFull && 'active'}`} ref={responseRef} id="response">Room is full, try another one!</div>
        </div>
    );
}
