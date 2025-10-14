import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { isAuthenticated } from "@/lib/utils";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useRef(false);

  useEffect(() => {
    let newSocket: Socket | null = null;

    const connectSocket = () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnecting.current) {
        return;
      }

      if (!isAuthenticated()) {
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }

      isConnecting.current = true;

      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      newSocket = io(BACKEND_URL, {
        auth: {
          token: `Bearer ${token}`,
        },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket", "polling"],
        timeout: 10000, // 10 second timeout
      });

      newSocket.on("connect", () => {
        setConnected(true);
        isConnecting.current = false;
        reconnectAttempts.current = 0;
      });

      newSocket.on("disconnect", (reason) => {
        setConnected(false);
        isConnecting.current = false;

        // Attempt to reconnect if it's not a forced disconnection
        if (
          reason !== "io client disconnect" &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          setTimeout(connectSocket, 1000 * reconnectAttempts.current);
        }
      });

      newSocket.on("connect_error", (error) => {
        setConnected(false);
        isConnecting.current = false;
      });

      socketRef.current = newSocket;
    };

    connectSocket();

    // Clean up function
    return () => {
      isConnecting.current = false;
      if (socketRef.current) {
        // Only close if the socket is actually connected
        if (socketRef.current.connected) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, []);

  return { socket: socketRef.current, connected };
}
