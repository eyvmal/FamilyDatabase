import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function ErrorSnackbar({ open, onClose, errorMessage }) {
	return (
		<Snackbar
			open={open}
			autoHideDuration={6000}
			onClose={onClose}
			anchorOrigin={{ vertical: "top", horizontal: "center" }}
		>
			<Alert onClose={onClose} severity="error" variant="filled">
				{errorMessage}
			</Alert>
		</Snackbar>
	);
}

export default ErrorSnackbar;
