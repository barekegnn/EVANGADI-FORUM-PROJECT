import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	function handleLogout() {
		localStorage.removeItem("token");
		navigate("/login");
	}

	return (
		<Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" sx={{ flexGrow: 1 }} component={Link} to="/" style={{ color: "inherit", textDecoration: "none" }}>
						HU Connect
					</Typography>
					<Button color="inherit" component={Link} to="/">Questions</Button>
					{token ? (
						<>
							<Button color="inherit" component={Link} to="/ask">Ask</Button>
							<Button color="inherit" component={Link} to="/notifications">Notifications</Button>
							<Button color="inherit" component={Link} to="/profile">Profile</Button>
							<Button color="inherit" onClick={handleLogout}>Logout</Button>
						</>
					) : (
						<>
							<Button color="inherit" component={Link} to="/login">Login</Button>
							<Button color="inherit" component={Link} to="/register">Register</Button>
						</>
					)}
				</Toolbar>
			</AppBar>
			<Container sx={{ flex: 1, py: 3 }}>
				<Outlet />
			</Container>
		</Box>
	);
}

