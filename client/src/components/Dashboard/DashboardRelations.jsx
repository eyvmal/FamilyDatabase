import { useCallback, useMemo, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import Navbar from "./Navbar";
import ErrorSnackbar from "./ErrorSnackbar";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
	Tooltip,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";

const DashboardRelations = () => {
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [relationData, setRelationData] = useState([]);
	const [peopleData, setPeopleData] = useState([]);
	const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const showErrorSnackbar = (message) => {
		setErrorMessage(message);
		setIsSnackbarOpen(true);
	};

	const handleCloseSnackbar = () => {
		setIsSnackbarOpen(false);
	};

	useEffect(() => {
		fetchPeopleData();
	}, []);

	useEffect(() => {
		// Only fetch relation data if there are people in peopleData
		if (peopleData.length > 0) {
			fetchRelationData();
		}
	}, [peopleData]);

	function isValidDate(dateString) {
		const regex = /^\d{2}-\d{2}-\d{4}$/;

		if (!regex.test(dateString))
			return {
				isValid: false,
				message: "Feil format på dato. Må være DD-MM-YYYY.",
			};

		const parts = dateString.split("-");
		const day = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10);
		const year = parseInt(parts[2], 10);

		if (year < 1500 || year > 2500)
			return {
				isValid: false,
				message: "Årstall må være mellom 1500 og 2500.",
			};
		if (month === 0 || month > 12)
			return { isValid: false, message: "Måneder må være mellom 1 og 12." };

		let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		// Adjust for leap years
		if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
			monthLength[1] = 29;
		}

		// Check the range of the day
		if (day <= 0 || day > monthLength[month - 1]) {
			return {
				isValid: false,
				message: `Denne måneden må være mellom 1 og ${
					monthLength[month - 1]
				} dager.`,
			};
		}

		return { isValid: true, message: "Godkjent dato." };
	}

	// Check for and remove nulls
	const sanitizeItem = (item) => {
		const newItem = { ...item };
		for (let key in newItem) {
			if (newItem[key] === null || newItem[key] === undefined) {
				newItem[key] = ""; // Replace null/undefined with an empty string
			}
		}
		return newItem;
	};

	// Fetch all people from database and save it to a local variable
	const fetchPeopleData = async () => {
		try {
			const response = await fetch("http://localhost:4000/people");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const rawData = await response.json();
			const sanitizedData = rawData.map(sanitizeItem); // Sanitize each item
			setPeopleData(sanitizedData);
		} catch (error) {
			console.error("There was a problem fetching the people data:", error);
		}
	};

	// Fetch all relations from database and save it to a local variable
	const fetchRelationData = async () => {
		try {
			const response = await fetch("http://localhost:4000/relations");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const rawData = await response.json();
			const sanitizedData = rawData.map(sanitizeItem); // Sanitize each item

			const transformedData = sanitizedData.map((relation) => {
				const person1 = peopleData.find(
					(person) => person.id === relation.id_person1
				);
				const person2 = peopleData.find(
					(person) => person.id === relation.id_person2
				);

				return {
					...relation,
					person1firstname: person1 ? `${person1.firstname}` : "Unknown",
					person1lastname: person1 ? `${person1.lastname}` : "Unknown",
					person2firstname: person2 ? `${person2.firstname}` : "Unknown",
					person2lastname: person2 ? `${person2.lastname}` : "Unknown",
				};
			});

			setRelationData(transformedData);
		} catch (error) {
			console.error("There was a problem fetching the relation data:", error);
		}
	};

	// Add a new relation to the database
	const addRelation = async (values) => {
		try {
			if (
				!(
					values.person1firstname.length > 0 &&
					values.person1lastname.length > 0
				)
			) {
				showErrorSnackbar("Skriv inn både fornavn og etternavn på Person 1");
				return false;
			}

			if (
				!(
					values.person2firstname.length > 0 &&
					values.person2lastname.length > 0
				)
			) {
				showErrorSnackbar("Skriv inn både fornavn og etternavn på Person 2");
				return false;
			}

			if (values.married < 0) {
				const dateValidation = isValidDate(values.married);
				if (!dateValidation.isValid) {
					showErrorSnackbar(dateValidation.message);
					return false;
				}
			}

			const response = await axios.post(
				"http://localhost:4000/addRelation",
				values
			);
			if (response.data.success) {
				relationData.push(values);
				setRelationData([...relationData]);
				return true;
			} else {
				showErrorSnackbar(response.data.message);
				console.error(response);
				return false;
			}
		} catch (error) {
			showErrorSnackbar("En feil har oppstått!");
			console.error(error);
			return false;
		}
	};

	// Edit a relation in the database
	const editRelation = async ({ exitEditingMode, row, values }) => {
		if (!Object.keys(validationErrors).length) {
			try {
				// Find the person IDs based on the provided firstnames and lastnames
				const person1 =
					peopleData.find(
						(person) =>
							person.firstname === values.person1firstname &&
							person.lastname === values.person1lastname
					) || null;

				const person2 =
					peopleData.find(
						(person) =>
							person.firstname === values.person2firstname &&
							person.lastname === values.person2lastname
					) || null;

				if (values.married < 0) {
					const dateValidation = isValidDate(values.married);

					if (!dateValidation.isValid) {
						showErrorSnackbar(dateValidation.message);
						return;
					}
				}

				if (Boolean(person1 && person2)) {
					const response = await axios.post(
						"http://localhost:4000/editRelation",
						{
							id: row.original.id,
							id_person1: person1.id,
							id_person2: person2.id,
							values,
						}
					);

					if (response.data.success) {
						relationData[row.index] = values;
						setRelationData([...relationData]);
						exitEditingMode();
					} else {
						showErrorSnackbar(response.data.message);
						console.error(response.data.message);
						return;
					}
				} else {
					if (!person1) {
						showErrorSnackbar(
							`Finner ingen personer med navn ${values.person1firstname} ${values.person1lastname}!`
						);
						return;
					}
					if (!person2) {
						showErrorSnackbar(
							`Finner ingen personer med navn ${values.person2firstname} ${values.person2lastname}!`
						);
						return;
					}
				}
			} catch (error) {
				showErrorSnackbar("En feil har oppstått!");
				console.error(error);
			}
		}
	};

	const handleCancelRowEdits = () => {
		setValidationErrors({});
	};

	// Delete a relation in the database
	const deleteRelation = useCallback(
		async (row) => {
			if (
				!confirm(
					`Are you sure you want to delete that "${row.getValue(
						"person1firstname"
					)} ${row.getValue("person1lastname")} is ${row.getValue(
						"person2firstname"
					)} ${row.getValue("person2lastname")}'s ${row.getValue("relation")}"?`
				)
			) {
				return;
			}

			try {
				const response = await axios.delete(
					"http://localhost:4000/deleteRelation",
					{
						data: { id: row.original.id },
					}
				);

				if (response.data.success) {
					relationData.splice(row.index, 1);
					setRelationData([...relationData]);
				} else {
					showErrorSnackbar(response.data.message);
					console.error(response.data.message);
				}
			} catch (error) {
				showErrorSnackbar("En feil har oppstått!");
				console.error(error);
			}
		},
		[relationData]
	);

	const getCommonEditTextFieldProps = useCallback(
		(cell) => {
			return {
				error: !!validationErrors[cell.id],
				helperText: validationErrors[cell.id],
				onBlur: (event) => {
					const isValid = true; // Set validation logic
					if (!isValid) {
						//set validation error for cell if invalid
						setValidationErrors({
							...validationErrors,
							[cell.id]: `${cell.column.columnDef.header} is required`,
						});
					} else {
						//remove validation error for cell if valid
						delete validationErrors[cell.id];
						setValidationErrors({
							...validationErrors,
						});
					}
				},
			};
		},
		[validationErrors]
	);

	const columns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "ID",
				enableColumnOrdering: false,
				enableEditing: false, //disable editing on this column
				enableSorting: false,
				size: 20,
			},
			{
				accessorKey: "person1firstname",
				header: "Person 1: Fornavn",
				size: 60,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "person1lastname",
				header: "Person 1: Etternavn",
				size: 60,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "person2firstname",
				header: "Person 2: Fornavn",
				size: 60,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "person2lastname",
				header: "Person 2: Etternavn",
				size: 60,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "relation",
				header: "Forhold",
				size: 30,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "married",
				header: "Gift",
				size: 20,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
		],
		[getCommonEditTextFieldProps]
	);

	return (
		<>
			<Navbar /> {/* Navbar is moved here */}
			<MaterialReactTable
				displayColumnDefOptions={{
					"mrt-row-actions": {
						muiTableHeadCellProps: {
							align: "center",
						},
						size: 60,
					},
				}}
				columns={columns}
				data={relationData}
				editDisplayMode="modal" //default
				enableColumnOrdering
				enableEditing
				onEditingRowSave={editRelation}
				onEditingRowCancel={handleCancelRowEdits}
				renderRowActions={({ row, table }) => (
					<Box sx={{ display: "flex", gap: "1rem" }}>
						<Tooltip arrow placement="left" title="Rediger">
							<IconButton onClick={() => table.setEditingRow(row)}>
								<Edit />
							</IconButton>
						</Tooltip>
						<Tooltip arrow placement="right" title="Slett">
							<IconButton color="error" onClick={() => deleteRelation(row)}>
								<Delete />
							</IconButton>
						</Tooltip>
					</Box>
				)}
				renderTopToolbarCustomActions={() => (
					<Button
						color="secondary"
						onClick={() => setCreateModalOpen(true)}
						variant="contained"
					>
						Legg til ny relasjon
					</Button>
				)}
			/>
			<CreateNewAccountModal
				columns={columns}
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSubmit={addRelation}
			/>
			<ErrorSnackbar
				open={isSnackbarOpen}
				onClose={handleCloseSnackbar}
				errorMessage={errorMessage}
			/>
		</>
	);
};

//example of creating a mui dialog modal for creating new rows
export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
	const [values, setValues] = useState(() =>
		columns.reduce((acc, column) => {
			acc[column.accessorKey ?? ""] = "";
			return acc;
		}, {})
	);

	const handleSubmit = async () => {
		const response = await onSubmit(values);
		if (response && response.data && response.data.success) {
			onClose();
		}
	};

	return (
		<Dialog open={open}>
			<DialogTitle textAlign="center">Relasjonsdata</DialogTitle>
			<DialogContent>
				<form onSubmit={(e) => e.preventDefault()}>
					<Stack
						sx={{
							width: "100%",
							minWidth: { xs: "300px", sm: "360px", md: "400px" },
							gap: "1.5rem",
						}}
					>
						{columns.map(
							(column) =>
								column.accessorKey !== "id" && ( // Add this condition
									<TextField
										key={column.accessorKey}
										label={column.header}
										name={column.accessorKey}
										onChange={(e) =>
											setValues({ ...values, [e.target.name]: e.target.value })
										}
									/>
								)
						)}
					</Stack>
				</form>
			</DialogContent>
			<DialogActions sx={{ p: "1.25rem" }}>
				<Button onClick={onClose}>Avbryt</Button>
				<Button color="secondary" onClick={handleSubmit} variant="contained">
					Legg til
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DashboardRelations;
