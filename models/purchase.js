const { UTCizeDate, calcDaysDifference } = require("../customModules/helpers");
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
    productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
});

// PurchaseSchema.virtual("usageDates").get(function () {
//     return `${this.startConsDate} - ${this.endConsDate}`;
// });

// const UTCizeDate = (date) => {
//     const [day, month, year] = date.split("/");
//     rawDate = new Date(year, month - 1, day);
//     return Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
// };

// const calcDaysDifference = (startDate, endDate) => {
//     const _MS_PER_DAY = 1000 * 60 * 60 * 24;
//     return Math.floor((endDate - startDate) / _MS_PER_DAY);
// };

PurchaseSchema.virtual("daysUsed").get(function () {
    const startDate = UTCizeDate(this.startConsDate ? this.startConsDate : this.purchaseDate);
    const endDate = UTCizeDate(this.endConsDate ? this.endConsDate : "28/11/2020");
    return calcDaysDifference(startDate, endDate) + 1;
});

const Purchase = mongoose.model("Purchase", PurchaseSchema);

module.exports = { Purchase };
