import io from "socket.io-client";
import { createContext } from "react";

// Default server URL for socket connection
const DEFAULT_SERVER_URL = 'http://localhost:3001';

// Create socket connection
export const socket = io.connect(DEFAULT_SERVER_URL);

// Create context for socket
export const SocketContext = createContext(socket);
