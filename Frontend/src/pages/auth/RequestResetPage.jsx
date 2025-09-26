import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../lib/api.js";

export default function RequestResetPage() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);
		try {
			const { data } = await api.post("/auth/request-password-reset", { email });
			setMessage(data.message || "If a user exists, an email was sent.");
		} catch (err) {
			setError(err.response?.data?.error || "Failed to request reset");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box component="form" onSubmit={handleSubmit} maxWidth={480} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Request Password Reset</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{message && <Alert severity="success">{message}</Alert>}
				<TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<Button type="submit" variant="contained" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
			</Stack>
		</Box>
	);
}

