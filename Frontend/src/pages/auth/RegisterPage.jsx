import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function RegisterPage() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			await api.post("/auth/register", { username, email, password });
			setSuccess("Registered successfully. You can log in now.");
			setTimeout(() => navigate("/login"), 600);
		} catch (err) {
			setError(err.response?.data?.error || "Registration failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box component="form" onSubmit={handleSubmit} maxWidth={480} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Register</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{success && <Alert severity="success">{success}</Alert>}
				<TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
				<TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				<Button type="submit" variant="contained" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
				<Button component={Link} to="/login">Back to Login</Button>
			</Stack>
		</Box>
	);
}

