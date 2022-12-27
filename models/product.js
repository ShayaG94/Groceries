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
    startConsDate: String,
    endConsDate: String,
});

PurchaseSchema.virtual("usageDates").get(function () {
    return `${this.startConsDate} - ${this.endConsDate}`;
});

const splitDate = (date) => {
    return { day, month, year };
};

const UTCizeDate = (date) => {
    const [day, month, year] = date.split("/");
    rawDate = new Date(year, month - 1, day);
    return Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
};

const calcDaysDifference = (startDate, endDate) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.floor((endDate - startDate) / _MS_PER_DAY);
};

PurchaseSchema.virtual("daysUsed").get(function () {
    const startDate = UTCizeDate(this.startConsDate ? this.startConsDate : this.purchaseDate);
    const endDate = UTCizeDate(this.endConsDate ? this.endConsDate : "28/11/2020");
    return calcDaysDifference(startDate, endDate) + 1;
});

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
        type: [PurchaseSchema],
    },
});

ProductSchema.virtual("path").get(function () {
    return `${this._id}-${this.title.replaceAll(",", "").replaceAll(" ", "_")}`;
});

ProductSchema.virtual("categories").get(function () {
    return this.category.enum;
});

ProductSchema.virtual("totalSpent").get(function () {
    let totalSpent = 0;
    this.purchases.forEach((purchase) => (totalSpent += purchase.price));
    return totalSpent.toFixed(2);
});

ProductSchema.virtual("totalBought").get(function () {
    let totalBought = 0;
    this.purchases.forEach((purchase) => (totalBought += purchase.quantity));
    if (this.measureUnit === "unit") {
        return totalBought;
    } else {
        return totalBought.toFixed(3);
    }
});
ProductSchema.virtual("averagePrice").get(function () {
    return (this.totalSpent / this.totalBought).toFixed(2);
});

ProductSchema.virtual("totalConsumptionDays").get(function () {
    let totalDays = 0;
    this.purchases.forEach((purchase) => (totalDays += purchase.daysUsed));
    return totalDays;
});

ProductSchema.virtual("averageMonthlyCost").get(function () {
    const startDate = UTCizeDate(this.purchases[0].purchaseDate);
    const endDate = UTCizeDate(this.trackUsagePeriod ? this.purchases[this.purchases.length - 1].endConsDate : "28/11/2020");
    const totalDays = calcDaysDifference(startDate, endDate) + 1;
    return ((this.totalSpent / totalDays) * (365 / 12)).toFixed(2);
});
module.exports = mongoose.model("Product", ProductSchema);
