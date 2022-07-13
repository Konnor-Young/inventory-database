const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
      name: { type: String },
      condition: { type: String, enum: ['nm', 'lp','hp','mp'] },
      price: { type: mongoose.Types.Decimal128},
      game: { type:String, enum: ['MTG', 'Pokemon']}     
});

const orderSchema = mongoose.Schema({
    number: { type: Number },
    price: { type: mongoose.Types.Decimal128},
    direct: { type: Boolean}
});

const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = {
    Card,
    Order,
}
