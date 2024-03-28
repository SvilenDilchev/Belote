import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import NoPage from './pages/NoPage';
import { SocketContext, socket } from './context/socket';

function App() {
  const [rooms, setRooms] = useState(new Map());

  return (
    <div id='base'>
      {/* <Header /> */}
      <SocketContext.Provider value={socket}>
        <BrowserRouter>
          <Routes>
            <Route index element={<HomePage rooms={rooms} setRooms={setRooms} />} />
            <Route path='/home' element={<HomePage rooms={rooms} setRooms={setRooms} />} />
            <Route path='/room/:roomId' element={<RoomPage rooms={rooms} />} />
            <Route path='*' element={<NoPage />} />
          </Routes>
        </BrowserRouter>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
export { SocketContext };
