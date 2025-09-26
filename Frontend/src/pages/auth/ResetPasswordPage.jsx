import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function ResetPasswordPage() {
	const [params] = useSearchParams();
	const token = params.get("token") || "";
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);
		try {
			const { data } = await api.post("/auth/reset-password", { token, newPassword: password });
			setMessage(data.message || "Password reset successfully.");
		} catch (err) {
			setError(err.response?.data?.error || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box component="form" onSubmit={handleSubmit} maxWidth={480} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Reset Password</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{message && <Alert severity="success">{message}</Alert>}
				<TextField label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				<Button type="submit" variant="contained" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
			</Stack>
		</Box>
	);
}

