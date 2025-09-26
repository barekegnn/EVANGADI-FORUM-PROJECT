import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../lib/api.js";

export default function ExpertiseTagsPage() {
	const [tagsInput, setTagsInput] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users/current-user");
				setTagsInput((data.expertise_tags || []).join(", "));
			} catch (err) {
				setError("Failed to load expertise tags");
			}
		})();
	}, []);

	async function save() {
		setError("");
		setMessage("");
		try {
			const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
			await api.put("/users/expertise-tags", { tags });
			setMessage("Expertise tags updated");
		} catch (err) {
			setError(err.response?.data?.error || "Failed to update expertise tags");
		}
	}

	const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

	return (
		<Box maxWidth={640} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Expertise Tags</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{message && <Alert severity="success">{message}</Alert>}
				<TextField label="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
				<Stack direction="row" spacing={1}>{tags.map((t) => <Chip key={t} label={t} />)}</Stack>
				<Button variant="contained" onClick={save}>Save</Button>
			</Stack>
		</Box>
	);
}

