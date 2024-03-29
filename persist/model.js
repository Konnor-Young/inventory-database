const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
    location: { type: String },
    foil: { type: Boolean },
    condition: { type: String, enum: ['NM', 'LP', 'MP', 'HP', 'DMG'] },
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
    locations: { type: Map },
    cards: { type: [] },
    scryfall_uri: { type: String }

});

const orderSchema = mongoose.Schema({
    number: { type: String },
    direct: { type: Boolean },
    cards: { type: [] },
    status: { type: String, enum: ['standing', 'pulling', 'shipped', 'error'] },
    locations: { type: [] },
});

const storageSchema = mongoose.Schema({
    locationMap: { type: Map },
    shelves: { type: Number },
    drawers: { type: Number },
    boxes: { type: Number }
});

const userSchema = mongoose.Schema ({
        username: {type: String, required: true, unique: true },
        password: {type: String, required: true}
});

// ORDER Card Keys, Integer
const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);
const Unique = mongoose.model("Unique", uniqueSchema);
const Storage = mongoose.model("Storage", storageSchema);
const User = mongoose.model(`User`, userSchema);

module.exports = {
    Card,
    Order,
    Unique,
    Storage,
    User
}
