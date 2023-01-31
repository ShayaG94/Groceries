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
    productID: { type: Schema.Types.ObjectId, ref: "Product" },
});

PurchaseSchema.virtual("daysUsed").get(function () {
    if (!!this.startConsDate && !!this.endConsDate) {
        const startDate = UTCizeDate(this.startConsDate);
        const endDate = UTCizeDate(this.endConsDate);
        return calcDaysDifference(startDate, endDate) + 1;
    }
    return 0;
});

const Purchase = mongoose.model("Purchase", PurchaseSchema);

module.exports = { Purchase };
