const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
    location: { type: String },
    foil: { type: String, enum: ['None', 'Foil'] },
    condition: { type: String, enum:['nm', 'lp', 'mp', 'hp', 'dmg'] },
    price: { type: String },
    tcg_id: { type: String },
    local_image: { type: String },
});

const skuSchema = mongoose.Schema({
    tcg_id: { type: String },
    name: { type: String },
    set: { type: String },
    imageUris: { type: Map, of: String },
    price: { type: Map, of: String },
    quantity: { type: Map, of: Number },
    locations: { type: [String] },
    cards: { type: [cardSchema] },
    // store: { type: String },
    art: { type: Map, of: Boolean }
});

const orderSchema = mongoose.Schema({
    number: { type: String },
    direct: { type: Boolean },
    card: { type: Map, of: Number },
    status: { type: String, enum: ['standing', 'pulling', 'shipped'] },
});

// SKU Image URI Keys, Strings
Sku.image_uris.set('small', '');
Sku.image_uris.set('normal', '');
Sku.image_uris.set('large', '');
Sku.imge_uris.set('png', '');
Sku.image_uris.set('boarder_crop', '');

// SKU Price Keys, Strings
Sku.price.set('usd', '');
Sku.price.set('usd_foil', '');

// SKU Quantity Keys, Integer
Sku.quantity.set('available', 0);
Sku.quantity.set('reserved', 0);
Sku.quantity.set('physical', 0);

// SKU Art Keys, Boolean
Sku.art.set('borderless', 'false');
Sku.art.set('textless', 'false');
Sku.art.set('etched', 'false');
Sku.art.set('full_art', 'false');
Sku.art.set('promo', 'false');
Sku.art.set('oversized', 'false');

// ORDER Card Keys, Integer
Order.card.set('tcg_id', 0);
const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);
const Sku = mongoose.model("Sku", skuSchema);

module.exports = {
    Card,
    Order,
    Sku,
}
