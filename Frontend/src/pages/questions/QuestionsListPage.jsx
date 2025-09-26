import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api.js";
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function QuestionsListPage() {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["questions"],
		queryFn: async () => (await api.get("/questions")).data,
	});

	if (isLoading) return <Typography>Loading questions...</Typography>;
	if (isError) return <Alert severity="error">{error?.message || "Failed to load"}</Alert>;

	return (
		<Stack spacing={2}>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h5">Latest Questions</Typography>
				<Button component={Link} to="/ask" variant="contained">Ask Question</Button>
			</Box>
			{(data || []).map((q) => (
				<Card key={q.id}>
					<CardActionArea component={Link} to={`/questions/${q.id}`}>
						<CardContent>
							<Stack spacing={1}>
								<Typography variant="h6">{q.title}</Typography>
								<Typography variant="body2" color="text.secondary" noWrap>
									{q.content}
								</Typography>
								<Stack direction="row" spacing={1}>
									{(q.tags || []).map((t) => <Chip key={t} label={t} size="small" />)}
								</Stack>
								<Typography variant="caption" color="text.secondary">{q.views} views • {q.answer_count} answers • {q.votes} votes</Typography>
							</Stack>
						</CardContent>
					</CardActionArea>
				</Card>
			))}
		</Stack>
	);
}

