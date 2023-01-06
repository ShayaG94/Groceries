const mongoose = require("mongoose");
const { products } = require("./products");
const { Product } = require("../models/product");
const { Purchase } = require("../models/purchase");

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

    for (let product of products) {
        const { purchases } = product;
        const purchaseIDs = [];
        product.purchases = [];

        const newProd = new Product(product);
        await newProd.save();

        for (let purchase of purchases) {
            purchase.productID = newProd._id;
            const newPurchase = new Purchase(purchase);
            purchaseIDs.push(newPurchase._id);
            await newPurchase.save();
        }

        await Product.updateOne({ _id: newProd._id }, { purchases: purchaseIDs });
    }
};

seedDB().then(() => {
    db.close();
});
