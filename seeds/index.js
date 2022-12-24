const mongoose = require("mongoose");
const { products } = require("./products");
const Product = require("../models/product");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/groceries-app");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Groceries App: Database connected");
});

const seedDB = async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
};

seedDB().then(() => {
    db.close();
});
