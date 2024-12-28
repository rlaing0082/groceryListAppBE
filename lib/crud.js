const fs = require("fs"); // Module for file system operations
const path = require("path"); // Module for handling file paths
const UUIDUtilsCommonJS = require("./UUIDUtilsCommonJS"); // Utility module for generating UUIDs
const items_data = require("./items_data"); // Importing existing items data

let items = items_data.items; // Initialize items from the imported data

// Helper function to save the current state of items to the file
function saveItemsToFile() {
  const filePath = path.join(__dirname, "items_data.js"); // Define the file path for items_data.js
  const fileContent = `let items = ${JSON.stringify(
    items,
    null,
    2
  )};\n\nmodule.exports = { items };`; // Format items data for writing to the file

  // Write the formatted content to the file
  fs.writeFile(filePath, fileContent, "utf8", (err) => {
    if (err) {
      console.error("Error saving items to file:", err); // Log error if write operation fails
    } else {
      console.log("Items successfully saved to file."); // Log success message
    }
  });
}

// Function to create a new item
function createItem(item) {
  item.id = UUIDUtilsCommonJS.generateUUID(4); // Generate a unique ID for the new item
  items.push(item); // Add the new item to the items array
  saveItemsToFile(); // Save the updated items to the file

  const message = `Item id: ${item.id} successfully created.`; // Success message
  console.log(message); // Log the message

  return {
    status: "ok",
    message: message, // Return status and message
  };
}

// Function to read items, with an optional ID filter
function readItems(id = "") {
  let message = "Number of items fetched:"; // Message for logging

  if (id === "") {
    console.log(`${message} ${items.length}.`); // Log the number of items fetched
    return items; // Return all items
  } else {
    console.log(`${message} 1.`); // Log single item fetch
    return items.filter((item) => {
      return item.id === id; // Return the item matching the given ID
    });
  }
}

// Function to update an existing item
function updateItem(itemParam) {
  // Find the item to update by ID
  let itemToUpdate = items.find((item) => {
    return item.id === itemParam.idUpdate;
  });

  if (itemToUpdate) {
    const keys = Object.keys(itemToUpdate).filter((key) => key !== "id"); // Exclude the 'id' field from updates

    // Update the item fields based on the provided parameters
    keys.forEach((key) => {
      if (itemParam[`${key}Update`] !== undefined) {
        itemToUpdate[key] = itemParam[`${key}Update`];
      }
    });

    saveItemsToFile(); // Save the updated items to the file

    const message = `Item id: ${itemToUpdate.id} successfully updated.`; // Success message
    console.log(message); // Log the message

    return { status: "ok", message: message }; // Return success status and message
  } else {
    const message = `Item id: ${itemParam.idUpdate} not found.`; // Error message
    console.log(message); // Log the message
    return { status: "error", message: message }; // Return error status and message
  }
}

// Function to delete an item by ID
function deleteItem(id) {
  const initialLength = items.length; // Store the initial length of the items array
  items = items.filter((item) => item.id !== id); // Remove the item with the specified ID

  if (items.length < initialLength) {
    saveItemsToFile(); // Save the updated items to the file

    const message = `Item id: ${id} successfully deleted.`; // Success message
    console.log(message); // Log the message

    return { status: "ok", message: message }; // Return success status and message
  } else {
    const message = `Item id: ${id} not found.`; // Error message
    console.log(message); // Log the message
    return { status: "error", message: message }; // Return error status and message
  }
}

// Export the CRUD functions for external use
module.exports = { createItem, readItems, updateItem, deleteItem };
