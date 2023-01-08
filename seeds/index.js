const mongoose = require("mongoose");
const { products } = require("./products");
const { Product } = require("../models/product");
const { Purchase } = require("../models/purchase");
const { Category } = require("../models/category");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/groceries-app");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Groceries App: Database connected");
});

const seedDB = async () => {
    await Product.deleteMany({});
    await Purchase.deleteMany({});
    await Category.deleteMany({});

    for (let product of products) {
        const { purchases } = product;
        const purchaseIDs = [];
        product.purchases = [];

        let category;
        const categoriesDB = await Category.find({});
        if (categoriesDB.length === 0 || !categoriesDB.some((category) => category.name === product.category.toLowerCase())) {
            category = new Category({ name: product.category });
            await category.save();
        } else {
            category = await Category.findOne({ name: product.category.toLowerCase() });
        }
        product.category = category._id;
        const newProd = new Product(product);
        category.products.push(newProd._id);
        await category.save();
        await newProd.save();

        for (let purchase of purchases) {
            purchase.productID = newProd._id;
            const newPurchase = new Purchase(purchase);
            purchaseIDs.push(newPurchase._id);
            await newPurchase.save();
        }

        await Product.updateOne({ _id: newProd._id }, { purchases: purchaseIDs, category: category._id });
    }
};

seedDB().then(() => {
    db.close();
});
