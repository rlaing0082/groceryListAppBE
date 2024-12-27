const fs = require("fs");
const path = require("path");
const UUIDUtilsCommonJS = require("./UUIDUtilsCommonJS");
const items_data = require("./items_data");

let items = items_data.items;

// Helper function to save items to the file
function saveItemsToFile() {
  const filePath = path.join(__dirname, "items_data.js");
  const fileContent = `let items = ${JSON.stringify(
    items,
    null,
    2
  )};\n\nmodule.exports = { items };`;

  fs.writeFile(filePath, fileContent, "utf8", (err) => {
    if (err) {
      console.error("Error saving items to file:", err);
    } else {
      console.log("Items successfully saved to file.");
    }
  });
}

function createItem(item) {
  item.id = UUIDUtilsCommonJS.generateUUID(4);
  items.push(item);
  saveItemsToFile(); // Save after creating an item

  const message = `Item id: ${item.id} successfully created.`;
  console.log(message);

  return {
    status: "ok",
    message: message,
  };
}

function readItems(id = "") {
  let message = "Number of items fetched:";

  if (id === "") {
    console.log(`${message} ${items.length}.`);
    return items;
  } else {
    console.log(`${message} 1.`);
    return items.filter((item) => {
      return item.id === id;
    });
  }
}

function updateItem(itemParam) {
  let itemToUpdate = items.find((item) => {
    return item.id === itemParam.idUpdate;
  });

  if (itemToUpdate) {
    const keys = Object.keys(itemToUpdate).filter((key) => key !== "id");

    keys.forEach((key) => {
      if (itemParam[`${key}Update`] !== undefined) {
        itemToUpdate[key] = itemParam[`${key}Update`];
      }
    });

    saveItemsToFile(); // Save after updating an item

    const message = `Item id: ${itemToUpdate.id} successfully updated.`;
    console.log(message);

    return { status: "ok", message: message };
  } else {
    const message = `Item id: ${itemParam.idUpdate} not found.`;
    console.log(message);
    return { status: "error", message: message };
  }
}

function deleteItem(id) {
  const initialLength = items.length;
  items = items.filter((item) => item.id !== id);

  if (items.length < initialLength) {
    saveItemsToFile(); // Save after deleting an item

    const message = `Item id: ${id} successfully deleted.`;
    console.log(message);

    return { status: "ok", message: message };
  } else {
    const message = `Item id: ${id} not found.`;
    console.log(message);
    return { status: "error", message: message };
  }
}

module.exports = { createItem, readItems, updateItem, deleteItem };
