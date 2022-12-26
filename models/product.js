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

PurchaseSchema.virtual("usageDates").get(function () {
    return `${this.usagePeriod.startDate} - ${this.usagePeriod.endDate}`;
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
    const startDate = UTCizeDate(this.usagePeriod.startDate);
    const endDate = UTCizeDate(this.usagePeriod.endDate);
    return calcDaysDifference(startDate, endDate) + 1;
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
