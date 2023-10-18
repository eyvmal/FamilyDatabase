// Navbar.js
import React from "react";
import { Button, AppBar, Toolbar, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
	const navigate = useNavigate();

	return (
		<AppBar position="static">
			<Toolbar>
				<Box mr={3}>
					<Button color="inherit" onClick={() => navigate("/dashboard/people")}>
						People
					</Button>
				</Box>
				<Box mr={3}>
					<Button
						color="inherit"
						onClick={() => navigate("/dashboard/relations")}
					>
						Relations
					</Button>
				</Box>
				<Button color="inherit" onClick={() => navigate("/login")}>
					Logout
				</Button>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
