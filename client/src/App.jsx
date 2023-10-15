import React from "react";
import BackgroundSlider from "./components/BackgroundSlider/BackgroundSlider";
import SearchBar from "./components/SearchBar/SearchBar";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./components/theme";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<div>
				<BackgroundSlider>
					<SearchBar />
				</BackgroundSlider>
			</div>
		</ThemeProvider>
	);
}

export default App;
