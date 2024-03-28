import '../App.css';
import '../css/HomePage.css';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { SocketContext } from '../context/socket';

export default function Home({ rooms, setRooms }) {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [isRoomFull, setIsRoomFull] = useState(false);
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const joinRoom = async () => {
        if (username !== '' && room !== '' && !isRoomFull) {
            socket.emit('join_room', { roomID: room, playerName: username });
        } else {
            document.getElementById("response").innerText = 'Please enter your name and a room code!';
            setIsRoomFull(true);
            await delay(3000);
            setIsRoomFull(false);
        }
    };

    const delay = (delayInms) => {
        return new Promise(resolve => setTimeout(resolve, delayInms));
    };

    useEffect(() => {
        const handleSetRoom = (room) => {
            const newRooms = new Map(rooms);
            newRooms.set(room.roomID, room);
            setRooms(newRooms);
            navigate(`/room/:${room.roomID}`, { state: { roomID: room.roomID, players: room.players } });
        };

        socket.on('set_room', handleSetRoom);

        return () => {
            socket.off('set_room', handleSetRoom);
        };
    }, [rooms, navigate, setRooms, socket]);

    useEffect(() => {
        const handleRoomFull = async () => {
            document.getElementById("response").innerText = 'Room is full, try another one!';
            setIsRoomFull(true);
            await delay(3000);
            setIsRoomFull(false);
        };

        socket.on('room_full', handleRoomFull);

        return () => {
            socket.off('room_full', handleRoomFull);
        };
    }, [socket]);

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
            <div className={`systemResponse ${isRoomFull && 'active'}`} id="response">Room is full, try another one!</div>
        </div>
    );
}
