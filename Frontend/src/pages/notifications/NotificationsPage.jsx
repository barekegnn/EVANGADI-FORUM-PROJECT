import { useEffect, useState } from "react";
import { Alert, List, ListItem, ListItemText, Typography } from "@mui/material";
import { io } from "socket.io-client";

export default function NotificationsPage() {
	const [items, setItems] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;
		try {
			const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
				transports: ["websocket"],
				path: "/socket.io",
				auth: { token: `Bearer ${token}` },
			});
			socket.on("notification", (payload) => {
				setItems((prev) => [{
					id: `${payload.type}-${payload.entityId}-${payload.createdAt}`,
					...payload,
				}, ...prev]);
			});
			return () => socket.close();
		} catch (e) {
			setError("Failed to connect to notifications");
		}
	}, []);

	return (
		<>
			<Typography variant="h5" gutterBottom>Notifications</Typography>
			{error && <Alert severity="error">{error}</Alert>}
			<List>
				{items.map((n) => (
					<ListItem key={n.id} divider>
						<ListItemText primary={n.message} secondary={`${n.type} • ${new Date(n.createdAt || Date.now()).toLocaleString()}`} />
					</ListItem>
				))}
			</List>
		</>
	);
}

