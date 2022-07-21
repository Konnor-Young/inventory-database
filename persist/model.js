const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
    location: { type: String },
    foil: { type: Boolean },
    condition: { type: String, enum: ['nm', 'lp', 'mp', 'hp', 'dmg'] },
    price: { type: String },
    tcg_id: { type: String },
    local_image: { type: String },
});

const uniqueSchema = mongoose.Schema({
    tcg_id: { type: String },
    name: { type: String },
    set: { type: String },
    image_uris: { type: Map, of: String },
    price: { type: Map, of: String },
    quantity: { type: Map, of: Number },
    locations: { type: [] },
    cards: { type: [] },
    art: { type: Map, of: Boolean }
});

const orderSchema = mongoose.Schema({
    number: { type: String },
    direct: { type: Boolean },
    cards: { type: [] },
    status: { type: String, enum: ['standing', 'pulling', 'shipped'] },
    locations: { type: [] },
});


// ORDER Card Keys, Integer
const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);
const Unique = mongoose.model("Unique", uniqueSchema);

module.exports = {
    Card,
    Order,
    Unique
}
