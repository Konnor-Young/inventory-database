const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
    location: { type: String },
    foil: { type: String, enum: ['None', 'Foil'] },
    condition: { type: String, enum: ['nm', 'lp', 'mp', 'hp', 'dmg'] },
    price: { type: String },
    tcg_id: { type: String },
    local_image: { type: String },
});

const skuSchema = mongoose.Schema({
    tcg_id: { type: String },
    name: { type: String },
    set: { type: String },
    image_uris: { type: Map, of: String },
    price: { type: Map, of: String },
    quantity: { type: Map, of: Number },
    locations: { type: Map, of: [String] },
    cards: { type: [String] },
    art: { type: Map, of: Boolean }
});

const orderSchema = mongoose.Schema({
    number: { type: String },
    direct: { type: Boolean },
    card: { type: Map },
    status: { type: String, enum: ['standing', 'pulling', 'shipped'] },
});


// ORDER Card Keys, Integer
const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);
const Sku = mongoose.model("Sku", skuSchema);

module.exports = {
    Card,
    Order,
    Sku
}
