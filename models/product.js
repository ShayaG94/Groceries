const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    store: {
        name: String,
        branch: String,
    },
    purchaseDate: String,
    quantity: Number,
    price: Number,
    usagePeriod: {
        track: Boolean,
        startDate: String,
        endDate: String,
    },
});

PurchaseSchema.virtual("usagePeriodLength").get(function () {
    return `${this.usagePeriod.startDate} - ${this.usagePeriod.endDate}`;
});

const ProductSchema = new Schema({
    title: String,
    category: String,
    measure: {
        type: String,
        enum: ["kg", "liters", "units"],
    },
    purchases: {
        type: [PurchaseSchema],
    },
});

ProductSchema.virtual("pathifiedTitle").get(function () {
    return this.title.replaceAll(",", "").replaceAll(" ", "_");
});

ProductSchema.virtual("averagePrice").get(function () {
    let totalSpent = 0;
    this.purchases.forEach((purchase) => (totalSpent += purchase.price));
    return (totalSpent / this.purchases.length).toFixed(2);
});

module.exports = mongoose.model("Product", ProductSchema);
