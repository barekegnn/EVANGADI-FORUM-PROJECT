import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

export default function QuestionDetailPage() {
	const { id } = useParams();
	const qc = useQueryClient();
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["question", id],
		queryFn: async () => (await api.get(`/questions/${id}`)).data,
	});

	const addAnswer = useMutation({
		mutationFn: async (content) => (await api.post(`/questions/${id}/answers`, { content })).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["question", id] }),
	});

	if (isLoading) return <Typography>Loading...</Typography>;
	if (isError) return <Alert severity="error">{error?.message || "Failed to load"}</Alert>;

	return (
		<Stack spacing={2}>
			<Typography variant="h5">{data.title}</Typography>
			<Typography>{data.content}</Typography>
			<Box>
				<Button component={Link} to={`/questions/${id}/edit`}>Edit</Button>
			</Box>
			<Box>
				<Typography variant="h6">Answers</Typography>
				<Stack spacing={1}>
					{(data.answers || []).map((a) => (
						<Card key={a.id}>
							<CardContent>
								<Typography>{a.content}</Typography>
								<Typography variant="caption" color="text.secondary">by {a.author_username} • votes {a.votes}</Typography>
							</CardContent>
						</Card>
					))}
				</Stack>
			</Box>
			<AnswerForm onSubmit={(content) => addAnswer.mutate(content)} submitting={addAnswer.isPending} />
		</Stack>
	);
}

function AnswerForm({ onSubmit, submitting }) {
	const [value, setValue] = React.useState("");
	return (
		<Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(value); setValue(""); }}>
			<Stack spacing={1}>
				<TextField label="Your answer" value={value} onChange={(e) => setValue(e.target.value)} multiline minRows={3} required />
				<Button type="submit" variant="contained" disabled={submitting}>{submitting ? "Posting..." : "Post Answer"}</Button>
			</Stack>
		</Box>
	);
}

