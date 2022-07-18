const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
      name: { type: String },
      location: { type: String },
      foil: { type:String, enum: ['None', 'Foil']},     
});

const skuSchema = mongoose.Schema({
    tcgID: { type: String },
    image: { type: String },
    locations: { type: [String] },
    quantity: { type: Map, of: Number },
    name: { type: String },
    cards: {type: [cardSchema] },
    price: { type: String }
});

const orderSchema = mongoose.Schema({
    number: { type: String },
    direct: { type: Boolean },
    card: { type: Map, of: Number },
    status: { type: String, enum: ['standing', 'pulling', 'shipped'] },
});

const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);
const Sku = mongoose.model("Sku", skuSchema);

module.exports = {
    Card,
    Order,
    Sku,
}
