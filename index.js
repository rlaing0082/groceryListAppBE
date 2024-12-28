// Developer: Robert Laing
// Purpose: Express CRUD backend for grocery list app

const crud = require("./lib/crud"); // Import CRUD operations
const cors = require("cors"); // Import CORS middleware
const express = require("express"); // Import Express framework
const app = express(); // Initialize the Express application

// Auth dependencies
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const bcrypt = require("bcryptjs"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating JWT tokens
const fs = require("fs"); // File system module for reading/writing files

app.use(bodyParser.json()); // Middleware to parse JSON request bodies

// Load .env file for environment variables
require("dotenv").config();
// Use the .env file to set up configuration values
const PORT = parseInt(process.env.PORT); // Port number to run the app
const APP_NAME = process.env.APP_NAME; // Application name for logging

// Enable CORS for testing
app.use(cors());

// Middleware to parse JSON in incoming requests
app.use(express.json());

// Middleware to parse form data (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Auth: Define file to store user data
const USERS_FILE = "./lib/users.json"; // Path to the users file
const d = new Date(); // Get the current date and time for logging

// Load users from the file system (if file exists)
let users = [];
if (fs.existsSync(USERS_FILE)) {
  const data = fs.readFileSync(USERS_FILE, "utf-8"); // Read the file content
  users = JSON.parse(data); // Parse JSON data into a JavaScript array
}

// Helper function to save the users to the file system
function saveUsersToFile() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); // Write users to file in JSON format
}

// POST /register: Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  const existingUser = users.find((u) => u.username === username); // Check if the username already exists
  if (existingUser) {
    console.log(`${d}--Username: ${username} already exists  -- Code:400`);
    return res.status(400).json({ message: "Username already exists" }); // Return error if username exists
  }
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
  users.push({ username, password: hashedPassword }); // Add the new user to the users array
  saveUsersToFile(); // Save the updated users list to the file
  res.status(201).send("User registered"); // Send success response
  console.log(`${d}--Username: ${username} User registered  -- Code:201`);
});

// POST /login: Log in an existing user
app.post("/login", async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  const user = users.find((u) => u.username === username); // Find the user by username
  if (user && (await bcrypt.compare(password, user.password))) {
    // Check if the password matches
    const token = jwt.sign({ username }, "your_jwt_secret"); // Generate JWT token for authentication
    res.json({ token, username }); // Send the token and username as response
    console.log(`${d}--Username: ${username} logged in -- Code:200`);
  } else {
    res.status(401).json({ error: "Invalid username or password" }); // Send error for invalid credentials
    console.log(
      `${d}--Username: ${username} Invalid username or password -- Code:401`
    );
  }
});

// Create: POST request to create a new item
app.post("/", (req, res) => {
  const createItemResult = crud.createItem(req.body); // Call the createItem function from the CRUD module
  console.log("[POST - Method]");
  console.log("[Request]");
  console.log(req.body); // Log the request body
  console.log("[Response]");
  console.log(createItemResult); // Log the response from createItem
  res.send(createItemResult); // Send the response back to the client
});

// Read all items: GET request to retrieve all items
app.get("/", (req, res) => {
  const readItemsResult = crud.readItems(); // Call the readItems function to fetch all items
  console.log("[GET - Method]");
  console.log("[Request]");
  console.log("/"); // Log the request for all items
  console.log("[Response]");
  console.log(readItemsResult); // Log the fetched items
  res.send(readItemsResult); // Send the fetched items to the client
});

// Read one item by ID: GET request to retrieve an item by its ID
app.get("/:id", (req, res) => {
  const readItemsResult = crud.readItems(req.params.id); // Call the readItems function to fetch the item by ID
  console.log("[GET - Method]");
  console.log("[Request]");
  console.log("/" + req.params.id); // Log the request with the item ID
  console.log("[Response]");
  console.log(readItemsResult); // Log the fetched item
  res.send(readItemsResult); // Send the fetched item to the client
});

// Update: PUT request to update an existing item
app.put("/", (req, res) => {
  const updateItemResult = crud.updateItem(req.body); // Call the updateItem function from the CRUD module
  console.log("[PUT - Method]");
  console.log("[Request]");
  console.log(req.body); // Log the request body for updating the item
  console.log("[Response]");
  console.log(updateItemResult); // Log the response from updateItem
  res.send(updateItemResult); // Send the updated item data back to the client
});

// Delete: DELETE request to delete an item by ID
app.delete("/", (req, res) => {
  const deleteItemResult = crud.deleteItem(req.body.id); // Call the deleteItem function from the CRUD module
  console.log("[DELETE - Method]");
  console.log("[Request]");
  console.log(req.body); // Log the request body for deleting the item
  console.log("[Response]");
  console.log(deleteItemResult); // Log the result of the delete operation
  res.send(deleteItemResult); // Send the result back to the client
});

// Catch-all route for undefined URLs
app.get("*", (req, res) => {
  res.status(401).send({ status: 401, message: `Url: ${req.url} not found.` }); // Return 401 for unknown URLs
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on PORT ${PORT}`); // Log the app name and port
});
