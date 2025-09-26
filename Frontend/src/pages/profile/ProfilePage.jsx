import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../lib/api.js";

export default function ProfilePage() {
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users/current-user");
				setUsername(data.username || "");
				setBio(data.bio || "");
			} catch (err) {
				setError("Failed to load profile");
			}
		})();
	}, []);

	async function save() {
		setError("");
		setMessage("");
		try {
			await api.put("/users/profile", { username, bio });
			setMessage("Profile updated");
		} catch (err) {
			setError(err.response?.data?.error || "Failed to update profile");
		}
	}

	return (
		<Box maxWidth={640} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Profile</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{message && <Alert severity="success">{message}</Alert>}
				<TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
				<TextField label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} multiline minRows={3} />
				<Button variant="contained" onClick={save}>Save</Button>
			</Stack>
		</Box>
	);
}

