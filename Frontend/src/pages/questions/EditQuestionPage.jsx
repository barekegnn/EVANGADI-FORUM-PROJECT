import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../lib/api.js";
import { useNavigate, useParams } from "react-router-dom";

export default function EditQuestionPage() {
	const { id } = useParams();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(`/questions/${id}`);
				setTitle(data.title || "");
				setContent(data.content || "");
				setTagsInput((data.tags || []).join(", "));
			} catch (err) {
				setError("Failed to load question");
			}
		})();
	}, [id]);

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
			await api.put(`/questions/${id}`, { title, content, tags });
			navigate(`/questions/${id}`);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to update question");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box component="form" onSubmit={handleSubmit} maxWidth={720} mx="auto">
			<Stack spacing={2}>
				<Typography variant="h5">Edit Question</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				<TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
				<TextField label="Details" value={content} onChange={(e) => setContent(e.target.value)} required multiline minRows={5} />
				<TextField label="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
				<Button type="submit" variant="contained" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
			</Stack>
		</Box>
	);
}

