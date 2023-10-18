import React, { useState } from "react";
import {
	Button,
	Container,
	Box,
	TextField,
	Typography,
	Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (event) => {
		event.preventDefault(); // Prevent default form submission

		try {
			const res = await axios.post("http://localhost:4000/login", {
				username: username,
				password: password,
			});

			if (res.data.auth) {
				navigate("/dashboard/people");
			} else {
				setErrorMessage("Login failed. Please check your credentials.");
			}
		} catch (error) {
			console.error("Error during login:", error);
			setErrorMessage("An error occurred. Please try again.");
		}
	};

	return (
		<Container
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
			}}
		>
			<Paper
				elevation={3}
				sx={{ padding: 4, width: "300px", borderRadius: "8px" }}
			>
				<Typography variant="h4" mb={3}>
					Login
				</Typography>

				{errorMessage && (
					<Typography color="error" mb={2}>
						{errorMessage}
					</Typography>
				)}

				<form onSubmit={handleLogin}>
					<Box mb={3}>
						<TextField
							fullWidth
							label="Username"
							variant="outlined"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</Box>

					<Box mb={3}>
						<TextField
							fullWidth
							type="password"
							label="Password"
							variant="outlined"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</Box>

					<Button type="submit" variant="contained" color="primary">
						Login
					</Button>
				</form>
			</Paper>
		</Container>
	);
};

export default Login;
