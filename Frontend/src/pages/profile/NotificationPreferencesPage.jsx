import { useEffect, useState } from "react";
import { Alert, Box, Button, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { api } from "../../lib/api.js";

export default function NotificationPreferencesPage() {
	const [emailEnabled, setEmailEnabled] = useState(true);
	const [pushEnabled, setPushEnabled] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users/current-user");
				setEmailEnabled(Boolean(data.email_notifications));
				setPushEnabled(Boolean(data.push_notifications));
			} catch (err) {
				setError("Failed to load preferences");
			}
		})();
	}, []);

	async function save() {
		setError("");
		setMessage("");
		try {
			await api.put("/users/notification-preferences", { email_notifications: emailEnabled, push_notifications: pushEnabled });
			setMessage("Preferences saved");
		} catch (err) {
			setError(err.response?.data?.error || "Failed to save preferences");
		}
	}

	return (
		<Box maxWidth={640} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Notification Preferences</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{message && <Alert severity="success">{message}</Alert>}
				<FormControlLabel control={<Switch checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />} label="Email notifications" />
				<FormControlLabel control={<Switch checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />} label="Push notifications" />
				<Button variant="contained" onClick={save}>Save</Button>
			</Stack>
		</Box>
	);
}

