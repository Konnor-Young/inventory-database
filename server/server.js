const express = require(`express`);
const app = express();
const cors = require(`cors`);
const { Card, Order, Unique, Storage } = require(`../persist/model`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.get("/cards", async (req, res) => {
    let uniqueCards;
    try {
        uniqueCards = await Unique.find({});
    } catch (err) {
        console.log('could not find card list', err);
        res.status(500).json({ message: 'cards not found', err: err });
    }
    res.status(200).json(uniqueCards);
});

app.get("/cards/:id", async (req, res) => {
    let card;
    try {
        card = await Card.findById(req.params.id);
    } catch (err) {
        console.log('could not find card', err);
        res.status(500).json({ message: 'card not found', err: err });
    }
    res.status(200).json(card);
});

app.get("/orders", async (req, res) => {
    let orderList;
    try {
        orderList = await Order.find({});
    } catch (err) {
        console.log(`could not find orders`, err);
        res.status(500).json({ message: `orders not found`, err: err });
    }
    res.status(200).json(orderList);
});

app.post("/cards", async (req, res) => {
    let unique;
    let card;
    try {
        card = await Card.create({
            location: 'here',
            foil: false,
            condition: req.body.condition,
            price: 'price',
            tcg_id: req.body.tcg_id,
            local_image: req.body.image_uris.small
        });
        console.log(card._id);
        unique = await Unique.findOne({
            tcg_id: req.body.tcg_id,
        });
        if (!unique) {
            unique = await Unique.create({
                tcg_id: req.body.tcg_id,
                name: req.body.name,
                set: req.body.set,
                image_uris: {
                    small: req.body.image_uris.small, normal: req.body.image_uris.normal,
                    large: req.body.image_uris.large, png: req.body.image_uris.png,
                    border_crop: req.body.image_uris.border_crop
                },
                price: { usd: req.body.prices.usd, usd_foil: req.body.prices.usd_foil },
                quantity: { available: 1, reserved: 0, physical: 1 },
                art: {
                    borderless: false, textless: false, etched: false, full_art: false,
                    promo: false, oversized: false
                }
            });
        }
        console.log(unique._id);
        unique = await Unique.findByIdAndUpdate(
            unique._id,
            {
                $push: {
                    cards: card._id,
                    locations: { location: 'here', card: card._id, price: card.price },
                }
            });
        console.log(unique.cards);
    } catch (err) {
        console.log(`could not create`, err);
        res.status(500).json({ message: `could not create`, err: err });
        return;
    }
    res.status(200).json(unique);
});

app.post("/orders", async (req, res) => {
    try {
        let order = Order.create({
            number: req.body.number,
            direct: req.body.direct,
            cards: req.body.cards,
            status: 'standing',
        });


        res.status(201).json(order);
    } catch (err) {
        console.log(`could not create`, err);
        res.status(500).json({ message: `could not create`, err: err });
    }
});

app.patch("/cards/:id", async (req, res) => {
    let card;
    let unique;
    let update;
    try {
        card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!card) {
            res.status(404).json({
                message: "Card Not Found!",
            });
            return;
        }
        update = { location: req.body.location, card: req.params.id, price: card.price };
        unique = await Unique.findOne({ tcg_id: card.tcg_id });
        if (!unique) {
            res.status(404).json({ message: `bug found card does but sku does not exist` });
            return;
        }
        for (let i in unique.locations){
            if(unique.locations[i].card == req.params.id){
                unique.locations[i] = update;
                unique.save();
            }
        }
        console.log(unique.locations);
    } catch (err) {
        console.log(`could not find`, err);
        res.status(500).json({ message: `could not edit`, err: err });
        return;
    }
    res.status(201).json(card);
});

app.patch("/orders/:id", async (req, res) => {
    let order;
    try {
        order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            res.status(404).json({
                message: "Order Not Found!",
            });
            return;
        }
        for (let i = 0; i < order.cards.length; i++) {
            // console.log(order.cards[i].quantity);
            let unique = await Unique.findOne({ tcg_id: order.cards[i].card });


            if (unique.quantity.get("available") < order.cards[i].quantity) {
                console.log('cards not available: ', "Available: ", unique.quantity.get("available"), "Requested: ", order.cards[i].quantity);
                return;
            }
            //subtract the quantity of the card in the order with the available quantity in the sku
            unique.quantity.set('available', unique.quantity.get("available") - order.cards[i].quantity);
            await unique.save();


            //add the quantity to reserved
            unique.quantity.set('reserved', unique.quantity.get("reserved") + order.cards[i].quantity);
            await unique.save();

            console.log(unique.quantity.get("available"));
            console.log(unique.quantity.get("reserved"));

        }
    } catch (err) {
        console.log(`could not find`, err);
        res.status(500).json({ message: `could not create`, err: err });
        return;
    }
    res.status(201).json(order);
});

app.delete(`/skus/:unique_id/cards/:card_id`, async (req, res) => {
    let card;
    let unique;
    try {
        card = await Card.findByIdAndDelete(req.params.card_id);
        console.log(`card ${card}`);
        unique = await Unique.findByIdAndUpdate(req.params.unique_id, {
            $pull: {
                cards: card._id,
                locations: { card: card._id }
            },
        });
        unique = await Unique.findById(req.params.unique_id);
        console.log(`unique ${unique}`)
        if (unique.cards.length === 0) {
            unique = await Unique.findByIdAndDelete(req.params.unique_id);
            res.status(200).json({ message: `unique deleted` });
        }
        res.status(200).json({ card: card, message: `card deleted` });
    } catch (err) {
        console.log(`error while deleting card ${err}`);
        res.status(500).json({ message: `error while deleting card`, err: err });
    }
});

app.delete(`/orders/:id`, async (req, res) => {
    let order;
    try {
        order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            res.status(404).json({ message: `order not found` });
            return;
        }
        res.status(200).json(order);
    } catch (err) {
        console.log(`could not delete`, err);
        res.status(500).json({ message: `could not delete`, err: err });
    }
});

module.exports = {
    server: app
}