const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/product");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const product = require("./models/product");

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

app.locals.categories = Product.schema.obj.category.enum;
app.locals.measureUnits = Product.schema.obj.measureUnit.enum;

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/products", async (req, res) => {
    const products = await Product.find().sort({ title: 1 });
    res.render("products/index", { products });
});
app.get("/products/new", (req, res) => {
    res.render("products/new");
});

app.post("/products", async (req, res) => {
    const data = req.body.product;
    data.trackUsagePeriod === "true" ? (data.trackUsagePeriod = true) : (data.trackUsagePeriod = false);
    const product = new Product(data);
    await product.save();
    res.redirect(`/products/${product.path}`);
});

app.get("/products/:id-:name", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/show", { product });
});

app.get("/products/:id-:name/edit", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/edit", { product });
});

app.put("/products/:id-:name", async (req, res) => {
    const data = req.body.product;
    data.trackUsagePeriod === "true" ? (data.trackUsagePeriod = true) : (data.trackUsagePeriod = false);
    await Product.findByIdAndUpdate(req.params.id, { ...data });
    res.redirect(`/products/${product.path}`);
});

app.delete("/products/:id-:name", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/products");
});

app.listen(3000, () => {
    console.log("Groceries App: Serving on port 3000");
});
