import { useState } from "react";
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function AskQuestionPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
			const { data } = await api.post("/questions", { title, content, tags });
			navigate(`/questions/${data.questionId}`);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to create question");
		} finally {
			setLoading(false);
		}
	}

	const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

	return (
		<Box component="form" onSubmit={handleSubmit} maxWidth={720} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Ask a Question</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				<TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
				<TextField label="Details" value={content} onChange={(e) => setContent(e.target.value)} required multiline minRows={5} />
				<TextField label="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
				<Stack direction="row" spacing={1}>{tags.map((t) => <Chip key={t} label={t} />)}</Stack>
				<Button type="submit" variant="contained" disabled={loading}>{loading ? "Posting..." : "Post Question"}</Button>
			</Stack>
		</Box>
	);
}

