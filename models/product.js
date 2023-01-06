const mongoose = require("mongoose");
const { Purchase } = require("./purchase");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: String,
    category: {
        type: String,
        enum: ["food"],
        lowercase: true,
    },
    measureUnit: {
        type: String,
        enum: ["kg", "liter", "unit"],
        lowercase: true,
    },
    trackUsagePeriod: Boolean,
    purchases: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }],
    },
});

ProductSchema.virtual("path").get(function () {
    return `${this._id}-${this.title.replaceAll(",", "").replaceAll(" ", "_")}`;
});

ProductSchema.virtual("categories").get(function () {
    return this.category.enum;
});

// ProductSchema.methods.totalSpent = async function () {
//     let totalSpent = 0;
//     this.purchases.forEach(async (purchaseID) => {
//         const purchase = await Purchase.findById(purchaseID);
//         totalSpent += purchase.price;
//     });
//     console.log(totalSpent);
//     return totalSpent.toFixed(2);
// };

// ProductSchema.methods.totalBought = async function () {
//     let totalBought = 0;
//     this.purchases.forEach(async (purchaseID) => {
//         const purchase = await Purchase.findById(purchaseID);
//         totalBought += purchase.quantity;
//     });
//     if (this.measureUnit === "unit") {
//         return totalBought;
//     } else {
//         return totalBought.toFixed(3);
//     }
// };

// ProductSchema.methods.averagePrice = async function () {
//     return ((await this.totalSpent()) / (await this.totalBought())).toFixed(2);
// };

// ProductSchema.methods.totalConsumptionDays = async function () {
//     let totalDays = 0;
//     this.purchases.forEach(async (purchaseID) => {
//         const purchase = await Purchase.findById(purchaseID);
//         totalDays += purchase.daysUsed;
//     });
//     return totalDays;
// };

// ProductSchema.methods.averageMonthlyCost = async function () {
//     const firstPurchase = await Purchase.findById(this.purchases[0]);
//     const lastPurchase = await Purchase.findById(this.purchases[this.purchases.length - 1]);
//     const startDate = UTCizeDate(firstPurchase.purchaseDate);
//     const endDate = UTCizeDate(this.trackUsagePeriod ? lastPurchase.endConsDate : "28/11/2020");
//     const totalDays = calcDaysDifference(startDate, endDate) + 1;
//     return (((await this.totalSpent()) / (await this.totalDays())) * (365 / 12)).toFixed(2);
// };

const Product = mongoose.model("Product", ProductSchema);

module.exports = { Product };
