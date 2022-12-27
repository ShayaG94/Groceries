const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/product");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/groceries-app");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Groceries App: Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("*/js", express.static(path.join(__dirname, "/public/js")));
app.use("*/css", express.static(path.join(__dirname, "/public/css")));
app.use("*/media", express.static(path.join(__dirname, "/public/media")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/products", async (req, res) => {
    const products = await Product.find().sort({ title: 1 });
    res.render("products/index", { products });
});
app.get("/products/new", async (req, res) => {
    const categories = Product.schema.obj.category.enum;
    const measureUnits = Product.schema.obj.measureUnit.enum;
    res.render("products/new", { categories, measureUnits });
});

app.get("/products/:id-:name", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/show", { product });
});

app.listen(3000, () => {
    console.log("Groceries App: Serving on port 3000");
});
