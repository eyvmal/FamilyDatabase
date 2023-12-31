import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import ProfilePage from "./components/ProfilePage/ProfilePage.jsx";
import Login from "./components/Login/Login.jsx";
import DashboardPeople from "./components/Dashboard/DashboardPeople.jsx";
import DashboardRelations from "./components/Dashboard/DashboardRelations.jsx";
import "./index.css";

function Main() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/login" element={<Login />} />
				<Route path="/dashboard/people" element={<DashboardPeople />} />
				<Route path="/dashboard/relations" element={<DashboardRelations />} />
			</Routes>
		</Router>
	);
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Main />
	</React.StrictMode>
);
