import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#32a852",
			contrastText: "#242624", // optional
		},
		secondary: {
			main: "#dfebe2",
		},
		// ... Add any other colors you want to override here
	},
});

export default theme;
