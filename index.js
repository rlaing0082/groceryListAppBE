// Developer: Roderick Bernardo
// Purpose: Express crud backend app

const crud = require("./lib/crud");
const cors = require("cors");
const express = require("express");
const app = express();
//auth
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

app.use(bodyParser.json());
//auth

// Load .env file
require("dotenv").config();
// Use the .env file to set the following
const PORT = parseInt(process.env.PORT);
const APP_NAME = process.env.APP_NAME;

// Allow CORS for testing
app.use(cors());

// To handle Json body requests
app.use(express.json());

// To handle form data
app.use(express.urlencoded({ extended: true }));

//Auth

const USERS_FILE = "./lib/users.json"; // File to store user data
const d = new Date();

// Load users from the file system
let users = [];
if (fs.existsSync(USERS_FILE)) {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  users = JSON.parse(data);
}

// Helper function to save users to the file system
function saveUsersToFile() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    console.log(`${d}--Username: ${username} already exists  -- Code:400`);
    return res.status(400).json({ message: "Username already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  saveUsersToFile(); // Save users to the file after registration
  res.status(201).send("User registered");
  console.log(`${d}--Username: ${username} User registered  -- Code:201`);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ username }, "your_jwt_secret");
    res.json({ token, username });
    console.log(`${d}--Username: ${username} logged in -- Code:200`);
  } else {
    // Respond with 401 status and error message for invalid credentials
    res.status(401).json({ error: "Invalid username or password" });
    console.log(
      `${d}--Username: ${username} Invalid username or password -- Code:401`
    );
  }
});
//Auth

// Create
app.post("/", (req, res) => {
  const createItemResult = crud.createItem(req.body);
  console.log("[POST - Method]");
  console.log("[Request]");
  console.log(req.body);
  console.log("[Response]");
  console.log(createItemResult);
  res.send(createItemResult);
});

// Read all albums
app.get("/", (req, res) => {
  const readItemsResult = crud.readItems();
  console.log("[GET - Method]");
  console.log("[Request]");
  console.log("/");
  console.log("[Response]");
  console.log(readItemsResult);
  res.send(readItemsResult);
});

// Read one album
app.get("/:id", (req, res) => {
  const readItemsResult = crud.readItems(req.params.id);
  console.log("[GET - Method]");
  console.log("[Request]");
  console.log("/" + req.params.id);
  console.log("[Response]");
  console.log(readItemsResult);
  res.send(readItemsResult);
});

// Update
app.put("/", (req, res) => {
  const updateItemResult = crud.updateItem(req.body);
  console.log("[PUT - Method]");
  console.log("[Request]");
  console.log(req.body);
  console.log("[Response]");
  console.log(updateItemResult);
  res.send(updateItemResult);
});

// Delete
app.delete("/", (req, res) => {
  const deleteItemResult = crud.deleteItem(req.body.id);
  console.log("[DELETE - Method]");
  console.log("[Request]");
  console.log(req.body);
  console.log("[Response]");
  console.log(deleteItemResult);
  res.send(deleteItemResult);
});

app.get("*", (req, res) => {
  res.status(401).send({ status: 401, message: `Url: ${req.url} not found.` });
});

app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on PORT ${PORT}`);
});
