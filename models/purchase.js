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

PurchaseSchema.virtual("daysUsed").get(function () {
    const startDate = UTCizeDate(this.startConsDate ? this.startConsDate : this.purchaseDate);
    const endDate = UTCizeDate(this.endConsDate ? this.endConsDate : "28/11/2020");
    return calcDaysDifference(startDate, endDate) + 1;
});

const Purchase = mongoose.model("Purchase", PurchaseSchema);

module.exports = { Purchase };
