const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { Product } = require("./models/product");
const { Purchase } = require("./models/purchase");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const {
    UTCizeDate,
    calcDaysDifference,
    stringifyDate,
    getStats,
    getMeasureUnit,
    currecizePrice,
    uniticizeProduct,
} = require("./customModules/helpers");
const { Category } = require("./models/category");

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

app.use("/", async (req, res, next) => {
    const categories = await Category.find();
    app.locals.categories = categories.map((category) => category.name);
    next();
});

app.locals.measureUnits = Product.schema.obj.measureUnit.enum;
app.locals.inputifyDate = function (date) {
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
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
    res.render("products/productList", { products, category });
});

app.get("/products/new", async (req, res) => {
    res.render("products/newProduct");
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
        product.totalBought = product.purchases.reduce((acc, purchase) => acc + purchase.quantity, 0).toFixed(3);
        product.totalSpent = product.purchases.reduce((acc, purchase) => acc + purchase.price, 0).toFixed(2);
        product.averagePrice = (product.totalSpent / product.totalBought).toFixed(2);
        product.totalConsumptionDays = product.purchases.reduce((acc, purchase) => acc + purchase.daysUsed, 0);
        product.averageMonthlyCost = (
            (product.totalSpent /
                (calcDaysDifference(
                    UTCizeDate(product.purchases[0].purchaseDate),
                    UTCizeDate(product.trackUsagePeriod ? product.purchases[product.purchases.length - 1].purchaseDate : "28/11/2020")
                ) +
                    1)) *
            (365 / 12)
        ).toFixed(2);

        product.stats = { ...getStats(product) };
        product.stats.totalBought = uniticizeProduct(product);
        product.stats.totalSpent = currecizePrice(product.stats.totalSpent);
        product.stats.averagePrice = currecizePrice(product.stats.averagePrice);
        product.stats.totalConsumptionDays = `${product.stats.totalConsumptionDays} days`;
        product.stats.monthlyConsumptionCost = currecizePrice(product.stats.monthlyConsumptionCost);
        product.stats.averageMonthlyCost = currecizePrice(product.stats.averageMonthlyCost);
    }
    res.render("products/productStats", { product });
});

app.get("/products/:id-:name/edit", async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category");
    res.render("products/editProduct", { product });
});

app.put("/products/:id-:name", async (req, res) => {
    const data = req.body.product;
    data.trackUsagePeriod === "true" ? (data.trackUsagePeriod = true) : (data.trackUsagePeriod = false);
    const category = await handleCategory(data.category);
    console.log(category);
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

app.get("/products/:id-:name/purchases", async (req, res) => {
    const product = await Product.findById(req.params.id);
    await product.populate("purchases");
    res.render("products/productPurchases", { product });
});

app.get("/products/:id-:name/purchases/new", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/newPurchase", { product });
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
    res.redirect(`/products/${product.path}/purchases`);
});

app.get("/products/:id-:name/purchases/:purchaseId/edit", async (req, res) => {
    const product = await Product.findById(req.params.id);
    const purchase = await Purchase.findById(req.params.purchaseId);
    res.render("products/editPurchase", { product, purchase });
});

app.put("/products/:id-:name/purchases/:purchaseId", async (req, res) => {
    const data = req.body.purchase;
    data.purchaseDate = stringifyDate(data.purchaseDate);
    await Purchase.findByIdAndUpdate(req.params.purchaseId, data, { new: true });
    const productPath = `${req.params.id}-${req.params.name}`;
    res.redirect(`/products/${productPath}/purchases`);
});

app.delete("/products/:id-:name/purchases/:purchaseId", async (req, res) => {
    await Purchase.findByIdAndDelete(req.params.purchaseId);
    const productPath = `${req.params.id}-${req.params.name}`;
    res.redirect(`/products/${productPath}/purchases`);
});

app.listen(3000, () => {
    console.log("Groceries App: Serving on port 3000");
});
