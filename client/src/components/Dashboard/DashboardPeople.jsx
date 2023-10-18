import { useCallback, useMemo, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import Navbar from "./Navbar";
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

const DashboardPeople = () => {
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [tableData, setTableData] = useState([]);

	useEffect(() => {
		fetchDatabase();
	}, []);

	// Fetch all people from database and save it to a local variable
	const fetchDatabase = async () => {
		try {
			const response = await fetch("http://localhost:4000/people");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			// Check for null or undefined values for all fields and provide a default value
			const sanitizedData = data.map((item) => {
				const newItem = { ...item };
				for (let key in newItem) {
					if (newItem[key] === null || newItem[key] === undefined) {
						newItem[key] = ""; // Assuming you want to replace null/undefined with an empty string
					}
				}
				return newItem;
			});
			setTableData(sanitizedData);
		} catch (error) {
			console.error("There was a problem fetching the data:", error);
		}
	};

	// Adds a new person to the database
	const addPerson = async (values) => {
		try {
			const response = await axios.post(
				"http://localhost:4000/addPerson",
				values
			);

			if (response.data.success) {
				tableData.push(values);
				setTableData([...tableData]);
			} else {
				console.error("Failed to add the person to the backend.");
			}
		} catch (error) {
			console.error("There was a problem sending data to the backend:", error);
		}
	};

	// Edit a person in the database
	const editPerson = async ({ exitEditingMode, row, values }) => {
		if (!Object.keys(validationErrors).length) {
			try {
				const response = await axios.post("http://localhost:4000/editPerson", {
					id: row.original.id,
					...values,
				});

				if (response.data.success) {
					tableData[row.index] = values;
					setTableData([...tableData]);
					exitEditingMode(); //required to exit editing mode and close modal
				} else {
					console.error("Failed to edit the person in the backend.");
				}
			} catch (error) {
				console.error(
					"There was a problem sending data to the backend:",
					error
				);
			}
		}
	};

	const handleCancelRowEdits = () => {
		setValidationErrors({});
	};

	// Delete a person in the database
	const deletePerson = useCallback(
		async (row) => {
			if (
				!confirm(
					`Are you sure you want to delete ${row.getValue(
						"firstname"
					)} ${row.getValue("lastname")}`
				)
			) {
				return;
			}
			try {
				const response = await axios.post(
					"http://localhost:4000/deletePerson",
					{
						id: row.original.id,
					}
				);

				if (response.data.success) {
					tableData.splice(row.index, 1);
					setTableData([...tableData]);
				} else {
					console.error("Failed to delete the person from the backend.");
				}
			} catch (error) {
				console.error(
					"There was a problem sending the delete request to the backend:",
					error
				);
			}
		},
		[tableData]
	);

	const getCommonEditTextFieldProps = useCallback(
		(cell) => {
			return {
				error: !!validationErrors[cell.id],
				helperText: validationErrors[cell.id],
				onBlur: (event) => {
					const isValid =
						cell.column.id === "email"
							? validateEmail(event.target.value)
							: cell.column.id === "age"
							? validateAge(+event.target.value)
							: validateRequired(event.target.value);
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
				accessorKey: "firstname",
				header: "Fornavn",
				size: 60,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "lastname",
				header: "Etternavn",
				size: 60,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "birth",
				header: "Fødsel",
				size: 20,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "death",
				header: "Død",
				size: 20,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "birthplace",
				header: "Fødested",
				size: 40,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "residence",
				header: "Bosted",
				size: 40,
				muiEditTextFieldProps: ({ cell }) => ({
					...getCommonEditTextFieldProps(cell),
				}),
			},
			{
				accessorKey: "description",
				header: "Beskrivelse",
				size: 200,
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
				data={tableData}
				editDisplayMode="modal" //default
				enableColumnOrdering
				enableEditing
				onEditingRowSave={editPerson}
				onEditingRowCancel={handleCancelRowEdits}
				renderRowActions={({ row, table }) => (
					<Box sx={{ display: "flex", gap: "1rem" }}>
						<Tooltip arrow placement="left" title="Edit">
							<IconButton onClick={() => table.setEditingRow(row)}>
								<Edit />
							</IconButton>
						</Tooltip>
						<Tooltip arrow placement="right" title="Delete">
							<IconButton color="error" onClick={() => deletePerson(row)}>
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
						Legg til ny person
					</Button>
				)}
			/>
			<CreateNewAccountModal
				columns={columns}
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSubmit={addPerson}
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

	const handleSubmit = () => {
		//put any validation logic here
		onSubmit(values);
		onClose();
	};

	return (
		<Dialog open={open}>
			<DialogTitle textAlign="center">Personalia</DialogTitle>
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

export default DashboardPeople;
