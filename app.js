const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { Product } = require("./models/product");
const { Purchase } = require("./models/purchase");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const { stringifyDate, getPrettyStats, sortByDate, getPurchaseInfo, getStorePurchases } = require("./customModules/helpers");
const { Category } = require("./models/category");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/groceries-app");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error:"));
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

app.use("/", async (req, res, next) => {
    const categories = await Category.find();
    app.locals.categories = categories.map((category) => category.name);
    next();
});

app.locals.measureUnits = Product.schema.obj.measureUnit.enum;

app.locals.inputifyDate = function (date) {
    if (!!date) {
        const [day, month, year] = date.split("/");
        if (month.length === 1) month = 0 + month;
        if (day.length === 1) day = 0 + day;
        return `${year}-${month}-${day}`;
    }
    return date;
};

app.locals.titlizeObjectKey = function (text) {
    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
};

async function handleCategory(category) {
    let handledCategory = undefined;
    if (!app.locals.categories.includes(category.toLowerCase())) {
        handledCategory = new Category({ name: category });
        await handledCategory.save();
    } else {
        handledCategory = await Category.findOne({ name: category });
    }
    return handledCategory;
}

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/products", async (req, res) => {
    const { category } = req.query;
    const filter = {};
    if (category) {
        const cat = await Category.findOne({ name: category });
        filter.category = cat._id;
    }
    const products = await Product.find(filter).populate("category").sort({ title: 1 });
    res.render("products/index", { products, category });
});

app.get("/products/new", async (req, res) => {
    res.render("products/new");
});

app.post("/products", async (req, res) => {
    const data = req.body.product;
    data.trackUsagePeriod === "true" ? (data.trackUsagePeriod = true) : (data.trackUsagePeriod = false);
    const category = await handleCategory(data.category);
    data.category = category._id;
    const product = new Product(data);
    category.products.push(product._id);
    await product.save();
    await category.save();
    res.redirect(`/products/${product.path}`);
});

app.get("/products/:id-:name", async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product.purchases.length > 0) {
        await product.populate("purchases");
        product.stats = { ...getPrettyStats(product) };
        for (const purchase of product.purchases) {
            purchase.info = { ...getPurchaseInfo(purchase, product) };
        }
        product.purchases.sort((a, b) => sortByDate(a.purchaseDate, b.purchaseDate, -1));
    }
    res.render("products/show", { product });
});

app.get("/products/:id-:name/edit", async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category");
    res.render("products/edit", { product });
});

app.put("/products/:id-:name", async (req, res) => {
    const data = req.body.product;
    data.trackUsagePeriod === "true" ? (data.trackUsagePeriod = true) : (data.trackUsagePeriod = false);
    const category = await handleCategory(data.category);
    data.category = category._id;
    const product = await Product.findByIdAndUpdate(req.params.id, { ...data });
    const oldCategoryID = product.category;
    if (oldCategoryID !== category._id) {
        await Category.updateOne({ _id: product.category }, { $pull: { products: product._id } });
        category.products.push(product._id);
        await category.save();
    }
    await product.save();
    res.redirect(`/products/${product.path}`);
});

app.delete("/products/:id-:name", async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    await Category.updateOne({ _id: product.category }, { $pull: { products: product._id } });
    res.redirect("/products");
});

app.get("/products/:id-:name/purchases/new", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("purchases/new", { product });
});

app.post("/products/:id-:name/purchases", async (req, res) => {
    const data = req.body.purchase;
    data.purchaseDate = stringifyDate(data.purchaseDate);
    data.startConsDate = stringifyDate(data.startConsDate);
    data.endConsDate = stringifyDate(data.endConsDate);

    const product = await Product.findById(req.params.id);
    data.productID = product._id;
    const purchase = new Purchase(data);
    product.purchases.push(purchase._id);
    await purchase.save();
    await product.save();
    res.redirect(`/products/${product.path}/?tab=purchases`);
});

app.patch("/products/:id-:name/purchases/:purchaseId/dates", async (req, res) => {
    const dates = req.body;
    for (const date in dates) {
        if (!!dates[date]) {
            dates[date] = stringifyDate(dates[date]);
        }
    }
    await Purchase.findByIdAndUpdate(req.params.purchaseId, dates);
    const productPath = `${req.params.id}-${req.params.name}`;
    res.redirect(`/products/${productPath}/?tab=purchases&purchase=${req.params.purchaseId}`);
});

app.put("/products/:id-:name/purchases/:purchaseId", async (req, res) => {
    const data = req.body.purchase;
    data.purchaseDate = stringifyDate(data.purchaseDate);
    await Purchase.findByIdAndUpdate(req.params.purchaseId, data);
    const productPath = `${req.params.id}-${req.params.name}`;
    res.redirect(`/products/${productPath}?tab=purchases&purchase=${req.params.purchaseId}`);
});

app.delete("/products/:id-:name/purchases/:purchaseId", async (req, res) => {
    await Purchase.findByIdAndDelete(req.params.purchaseId);
    const productPath = `${req.params.id}-${req.params.name}`;
    res.redirect(`/products/${productPath}/?tab=purchases`);
});

app.get("/store_purchases", async (req, res) => {
    const purchases = await Purchase.find({}).populate("productID");
    purchases.sort((a, b) => sortByDate(a.purchaseDate, b.purchaseDate, 1));
    const storePurchases = getStorePurchases(purchases);
    storePurchases.sort((a, b) => sortByDate(a.purchaseDate, b.purchaseDate, -1));
    res.render("storePurchase/index", { storePurchases });
});

app.get("/store_purchases/new", async (req, res) => {
    res.render("storePurchase/new");
});

app.post("/store_purchases", async (req, res) => {
    console.log(req.body);
    res.redirect("/store_purchases/index");
});

app.listen(3000, () => {
    console.log("Groceries App: Serving on port 3000");
});
