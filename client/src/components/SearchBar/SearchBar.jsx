import React, { useState, useEffect } from "react";
import "./SearchBar.css";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

const SearchBar = () => {
	const [query, setQuery] = useState("");
	const [names, setNames] = useState([]);
	const [selectedOption, setSelectedOption] = useState(null);

	useEffect(() => {
    axios
        .get("http://localhost:4000/names")
        .then((response) => {
            setNames(response.data.map(person => ({ title: person.name, id: person.id })));
        })
        .catch((error) => {
            console.error("Error fetching data from database:", error);
        });
}, []);

const handleSubmit = (e) => {
	e.preventDefault();
	if (!query.trim()) return;
	const matchingPerson = names.find(person => person.title.toLowerCase().includes(query.toLowerCase()));
	if (matchingPerson) {
			window.location.href = `http://localhost:5173/profile?id=${matchingPerson.id}`;
	}
};


const handleSelect = (newValue) => {
	setSelectedOption(newValue);
	const matchingPerson = names.find(person => person.title === newValue.title);
	if (matchingPerson) {
			window.location.href = `http://localhost:5173/profile?id=${matchingPerson.id}`;
	}
};

return (
	<Box
		component="form"
		className="form-box"
		onSubmit={handleSubmit}
	>
		<div className="centered-flex">
			<Paper className="paper-style">
				<Autocomplete
					getOptionLabel={(option) => option.title}
					value={selectedOption}
					inputValue={query}
					onInputChange={(event, newInputValue) => setQuery(newInputValue)}
					onChange={(event, newValue) => handleSelect(newValue)}
					options={names}
					noOptionsText={query && !names.some(name => name.title.toLowerCase().includes(query.toLowerCase())) ? "Ingen alternativer" : null}
					renderInput={(params) => (
							<TextField {...params} label="Familiemedlem" variant="outlined" className="text-field" />
					)}
				/>
			</Paper>
		</div>
	</Box>
	);
};

export default SearchBar;
