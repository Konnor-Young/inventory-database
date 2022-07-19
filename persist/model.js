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
    locations: { type: [String] },
    cards: { type: [cardSchema] },
    art: { type: Map, of: Boolean }
});

const orderSchema = mongoose.Schema({
    number: { type: String },
    direct: { type: Boolean },
    card: { type: Map, of: Number },
    status: { type: String, enum: ['standing', 'pulling', 'shipped'] },
});

// SKU Image URI Keys, Strings
function set_sku_uris(Sku, small, normal, large, png, boarder_crop) {
    Sku.image_uris.set('small', small);
    Sku.image_uris.set('normal', normal);
    Sku.image_uris.set('large', large);
    Sku.image_uris.set('png', png);
    Sku.image_uris.set('boarder_crop', boarder_crop);
};
// SKU Price Keys, Strings
function set_sku_prices(Sku, usd, usd_foil) {
    Sku.price.set('usd', usd);
    Sku.price.set('usd_foil', usd_foil);
};
// SKU Quantity Keys, Integer
function set_sku_quantity(Sku) {
    Sku.quantity.set('available', 1);
    Sku.quantity.set('reserved', 0);
    Sku.quantity.set('physical', 1);
};
// SKU Art Keys, Boolean
function set_sku_art(Sku) {
    Sku.art.set('borderless', 'false');
    Sku.art.set('textless', 'false');
    Sku.art.set('etched', 'false');
    Sku.art.set('full_art', 'false');
    Sku.art.set('promo', 'false');
    Sku.art.set('oversized', 'false');
}
// ORDER Card Keys, Integer
const Card = mongoose.model("Card", cardSchema);
const Order = mongoose.model("Order", orderSchema);
const Sku = mongoose.model("Sku", skuSchema);

module.exports = {
    Card,
    Order,
    Sku,
    set_sku_uris,
    set_sku_prices,
    set_sku_quantity,
    set_sku_art,
}
