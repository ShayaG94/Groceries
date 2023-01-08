const mongoose = require("mongoose");
const { Purchase } = require("./purchase");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    measureUnit: {
        type: String,
        enum: ["kg", "liter", "unit"],
        lowercase: true,
    },
    trackUsagePeriod: Boolean,
    purchases: {
        type: [{ type: Schema.Types.ObjectId, ref: "Purchase" }],
    },
});

ProductSchema.virtual("path").get(function () {
    return `${this._id}-${this.title.replaceAll(",", "").replaceAll(" ", "_")}`;
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = { Product };
