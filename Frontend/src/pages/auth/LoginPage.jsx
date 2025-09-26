import { useState } from "react";
import { Alert, Box, Button, Link as MLink, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../../lib/api.js";

export default function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { data } = await api.post("/auth/login", { email, password });
			setAuthToken(data.token);
			navigate("/");
		} catch (err) {
			setError(err.response?.data?.error || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box component="form" onSubmit={handleSubmit} maxWidth={420} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Login</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				<TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
				<TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
				<Button type="submit" variant="contained" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
				<Typography variant="body2">
					Don’t have an account? <MLink component={Link} to="/register">Register</MLink>
				</Typography>
				<Typography variant="body2">
					Forgot password? <MLink component={Link} to="/request-password-reset">Reset</MLink>
				</Typography>
			</Stack>
		</Box>
	);
}

