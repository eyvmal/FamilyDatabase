const express = require("express");
const cors = require("cors");
const pool = require("./database").pool;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Login verifiaction
const verifyJWT = (req, res, next) => {
	const token = req.cookies.token;
	// Check if there is a token
	if (!token) {
		res.json({ auth: false, message: "No token found!" });
	} else {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				res.json({ auth: false, message: "Failed to authenticate token!" });
			} else {
				req.userId = decoded.id;
				next();
			}
		});
	}
};

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const adminUsername = process.env.ADMIN_USERNAME;
	const adminPassword = process.env.ADMIN_PASSWORD;

	// Verify username and password
	if (username === adminUsername && password === adminPassword) {
		const jwtToken = jwt.sign(
			{ username: adminUsername },
			process.env.JWT_SECRET,
			{ expiresIn: 10 }
		);
		// Create a token-cookie
		res.cookie("token", jwtToken, {
			httpOnly: true,
			secure: false,
		});
		return res.json({ auth: true });
	}
	return res.json({ auth: false });
});

// Call this method to verify their session
app.post("/auth", verifyJWT, (req, res) => {
	res.json({ auth: true, message: "Successful authentication of token!" });
});

// Database queries
app.get("/names", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT id, firstname, lastname FROM people"
		);
		const formattedNamesWithID = result.rows
			.filter((person) => person.firstname && person.lastname)
			.map((person) => ({
				id: person.id,
				name: `${person.firstname} ${person.lastname}`,
			}));
		res.json(formattedNamesWithID);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Database query failed" });
	}
});

app.get("/people", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT *, TO_CHAR(birth, 'DD-MM-YYYY') AS birth, TO_CHAR(death, 'DD-MM-YYYY') AS death FROM people;"
		);
		res.json(result.rows);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Database query failed" });
	}
});

app.get("/p", async (req, res) => {
	try {
		const result = await pool.query("SELECT * FROM people WHERE id = $1", [
			req.query.id,
		]);
		if (result.rows.length > 0) {
			res.json(result.rows[0]);
		} else {
			res.status(404).json({ error: "Person not found" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Database query failed" });
	}
});

app.post("/addPerson", verifyJWT, async (req, res) => {
	try {
		const {
			firstname,
			lastname,
			birth: rawBirth,
			death: rawDeath,
			birthplace,
			residence,
			description,
		} = req.body;

		const birth = convertDateFormat(rawBirth);
		const death = rawDeath ? convertDateFormat(rawDeath) : null;

		const query = `
      INSERT INTO people (firstName, lastName, birth, death, birthplace, residence, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING *;
    `;

		const values = [
			firstname,
			lastname,
			birth,
			death,
			birthplace,
			residence,
			description,
		];
		const result = await pool.query(query, values);
		res.json({ success: result.rowCount > 0 });
	} catch (error) {
		console.error("Failed to insert data into the database:", error);
		res.status(500).json({ success: false });
	}
});

app.post("/editPerson", verifyJWT, async (req, res) => {
	try {
		const {
			id,
			firstname,
			lastname,
			birth: rawBirth,
			death: rawDeath,
			birthplace,
			residence,
			description,
		} = req.body;

		const birth = convertDateFormat(rawBirth);
		const death = rawDeath ? convertDateFormat(rawDeath) : null;

		const updateQuery = `
			UPDATE people SET
				firstName = $1,
				lastName = $2,
				birth = $3,
				death = $4,
				birthplace = $5,
				residence = $6,
				description = $7
			WHERE id = $8
		`;
		const values = [
			firstname,
			lastname,
			birth,
			death,
			birthplace,
			residence,
			description,
			id,
		];

		await pool.query(updateQuery, values);

		res.json({ success: true });
	} catch (error) {
		console.error("Failed to edit data in the database:", error);
		res.status(500).json({ success: false });
	}
});

app.post("/deletePerson", verifyJWT, async (req, res) => {
	try {
		const { id } = req.body; // Extract ID from request body

		console.log(id);

		if (!id) {
			return res
				.status(400)
				.json({ success: false, message: "ID is required" });
		}

		await pool.query("DELETE FROM people WHERE id = $1", [id]);

		res.json({ success: true });
	} catch (error) {
		console.error("Failed to delete data in the database:", error);
		res.status(500).json({ success: false });
	}
});

app.get("/r", async (req, res) => {
	try {
		const personID = req.query.id;

		const relations = await pool.query(
			"SELECT * FROM relations WHERE id_person1 = $1 OR id_person2 = $1",
			[personID]
		);

		let relationships = {
			dad: [],
			mom: [],
			partner: [],
			siblings: [],
			children: [],
		};

		for (let relation of relations.rows) {
			let relatedPersonID =
				relation.id_person1 === Number(personID)
					? relation.id_person2
					: relation.id_person1;
			let relatedPerson = (
				await pool.query("SELECT * FROM People WHERE id = $1", [
					relatedPersonID,
				])
			).rows[0];

			switch (relation.relation) {
				case "dad":
					if (Number(relation.id_person1) === Number(personID)) {
						relationships.children.push({
							id: relatedPerson.id,
							name: `${relatedPerson.firstname} ${relatedPerson.lastname}`,
						});
					} else {
						relationships.dad.push({
							id: relatedPerson.id,
							name: `${relatedPerson.firstname} ${relatedPerson.lastname}`,
						});
					}
					break;
				case "mom":
					if (Number(relation.id_person1) === Number(personID)) {
						relationships.children.push({
							id: relatedPerson.id,
							name: `${relatedPerson.firstname} ${relatedPerson.lastname}`,
						});
					} else {
						relationships.mom.push({
							id: relatedPerson.id,
							name: `${relatedPerson.firstname} ${relatedPerson.lastname}`,
						});
					}
					break;
				case "partner":
					relationships.partner.push({
						id: relatedPerson.id,
						name: `${relatedPerson.firstname} ${relatedPerson.lastname}`,
					});
					break;
			}
		}

		const dads = relationships.dad.map((dad) => dad.id);
		const moms = relationships.mom.map((mom) => mom.id);
		const siblingsFromDad = (
			await pool.query(
				"SELECT * FROM relations WHERE id_person1 = ANY($1) AND relation = 'dad' AND NOT id_person2 = $2",
				[dads, personID]
			)
		).rows;
		const siblingsFromMom = (
			await pool.query(
				"SELECT * FROM relations WHERE id_person1 = ANY($1) AND relation = 'dad' AND NOT id_person2 = $2",
				[moms, personID]
			)
		).rows;

		for (let sibling of siblingsFromDad) {
			let siblingData = (
				await pool.query("SELECT * FROM People WHERE id = $1", [
					sibling.id_person2,
				])
			).rows[0];
			relationships.siblings.push({
				id: siblingData.id,
				name: `${siblingData.firstname} ${siblingData.lastname}`,
			});
		}

		for (let sibling of siblingsFromMom) {
			let siblingData = (
				await pool.query("SELECT * FROM People WHERE id = $1", [
					sibling.id_person2,
				])
			).rows[0];
			relationships.siblings.push({
				id: siblingData.id,
				name: `${siblingData.firstname} ${siblingData.lastname}`,
			});
		}

		relationships.siblings = relationships.siblings.reduce((acc, current) => {
			const x = acc.find((item) => item.id === current.id);
			if (!x) {
				return acc.concat([current]);
			} else {
				return acc;
			}
		}, []);

		res.json(relationships);
	} catch (err) {
		console.log(err);
		res.status(500).json(null);
	}
});

app.listen(4000, () => console.log("Server on http://localhost:4000"));

function convertDateFormat(dateString) {
	const parts = dateString.split("-");
	if (parts.length !== 3) return null;
	const [day, month, year] = parts;
	return `${year}-${month}-${day}`;
}
