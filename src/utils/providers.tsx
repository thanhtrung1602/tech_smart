import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "../redux/store.ts";
import { useEffect, useState } from "react";
import { socket } from '../socket.ts';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            console.log("Connected to socket server");
            setIsConnected(true);
        }

        function onDisconnect() {
            console.log("Disconnected from socket server");
            setIsConnected(false);
        }

        function onConnectError(error: any) {
            console.error("Socket connection error:", error);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
        };
    }, []);

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    );
}
