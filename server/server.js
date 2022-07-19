const express = require(`express`);
const app = express();
const cors = require(`cors`);
const { Card, Order, Sku, } = require(`../persist/model`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.get("/cards", async (req, res)=>{
    let uniqueCards;
    try {
        uniqueCards = await Sku.find({});
    } catch (err) {
        console.log('could not find card list', err);
        res.status(500).json({message: 'cards not found', err: err});
    }
    res.status(200).json(uniqueCards);
});

app.get("/orders", async (req, res)=>{
    let orderList;
    try {
        orderList = await Order.find({});
    } catch (err) {
        console.log(`could not find orders`, err);
        res.status(500).json({message: `orders not found`, err: err});
    }
    res.status(200).json(orderList);
});

app.post("/cards", async (req, res)=>{
    let sku;
    try {
        sku = await Sku.findOne({
            tcg_id: req.body.tcg_id,
        });
        if (!sku) {
            sku = await Sku.create({
                tcg_id: req.body.tcg_id,
                name: req.body.name,
                set: req.body.set,
                locations: ['here'],
                image_uris: { small: req.body.image_uris.small, normal: req.body.image_uris.normal,
                    large: req.body.image_uris.large, png: req.body.image_uris.png, 
                    border_crop: req.body.image_uris.border_crop },
                price: { usd: req.body.prices.usd, usd_foil: req.body.prices.usd_foil },
                quantity: { available: 1, reserved: 0, physical: 1 },
                art: { borderless: false, textless: false, etched: false, full_art: false,
                    promo: false, oversized: false }
            });
        }
        sku = await Sku.findByIdAndUpdate(
            sku._id,
            {
                $push: {
                    cards: {
                        location: 'here',
                        foil: false,
                        condition: req.body.condition,
                        price: 'price',
                        tcg_id: req.body.tcg_id,
                        local_image: req.body.image_uris.large,
                    },
                },
            },
            {new: true,}
        );
    } catch (err) {
        console.log(`could not create`, err);
        res.status(500).json({message: `could not create`, err: err});
    }
    res.status(200).json(sku);
});

app.post("/orders", async (req, res)=>{
    try {
        let order = Order.create({
            number: req.body.number,
            direct: req.body.direct,
            card: req.body.order,
            status: standing,
        });
        res.status(201).json(order);
    } catch (err) {
        console.log(`could not create`, err);
        res.status(500).json({message: `could not create`, err: err});
    }
});

app.patch("/cards/:id", async (req, res)=>{
    let card;
    try {
        card = await Card.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!card) {
            res.status(404).json({
              message: "Card Not Found!",
            });
            return;
        } else {
            res.status(201).json(card);
        }
    } catch (err) {
        console.log(`could not find`, err);
        res.status(500).json({message: `could not create`, err: err});
    }
});

app.patch("/orders/:id", async (req, res)=>{
    let order;
    try {
        order = await Order.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!order) {
            res.status(404).json({
              message: "Order Not Found!",
            });
            return;
        } else {
            res.status(201).json(order);
        }
    } catch (err) {
        console.log(`could not find`, err);
        res.status(500).json({message: `could not create`, err: err});
    }
});

app.delete(`/cards/:id`, async (req, res)=>{
    let card;
    try{
        card = await Card.findByIdAndDelete(req.params.id);
        if(!card){
            res.status(404).json({message: `card not found`});
            return;
        }
        res.status(200).json(card);
    }catch(err){
        console.log(`could not delete`, err);
        res.status(500).json({message: `could not delete`, err: err});
    }
});

app.delete(`/orders/:id`, async (req, res)=>{
    let card;
    try{
        order = await Order.findByIdAndDelete(req.params.id);
        if(!order){
            res.status(404).json({message: `order not found`});
            return;
        }
        res.status(200).json(card);
    }catch(err){
        console.log(`could not delete`, err);
        res.status(500).json({message: `could not delete`, err: err});
    }
});

module.exports = {
    server: app
}