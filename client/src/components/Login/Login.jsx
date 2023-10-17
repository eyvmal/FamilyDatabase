import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import axios from "axios";
axios.defaults.withCredentials = true;

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loginStatus, setLoginStatus] = useState(false);

	const handleLogin = () => {
		axios
			.post("http://localhost:4000/login", {
				username: username,
				password: password,
			})
			.then((res) => {
				if (res.data.auth) {
					console.log("Login successful!");
					setLoginStatus(true);
				} else {
					console.log("Wrong username/password!");
					setLoginStatus(false);
				}
			});
	};

	const authenticate = () => {
		axios
			.post("http://localhost:4000/auth")
			.then((res) => {
				console.log(res.data.message);
			})
			.catch((error) => {
				console.error("There was an error:", error);
			});
	};

	return (
		<div>
			<TextField
				label="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<TextField
				label="Password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<Button onClick={handleLogin}>Login</Button>
			<Button onClick={authenticate}>Check Authentication</Button>
		</div>
	);
}

export default Login;
