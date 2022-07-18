const express = require(`express`);
const app = express();
const cors = require(`cors`);
const { Card, Order, Sku, 
    set_sku_uris, 
    set_sku_prices,
    set_sku_quantity,
    set_sku_art, } = require(`../persist/model`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.get("/cards", async (req, res)=>{
    let uniqueCards;
    try {
        cardList = await Sku.find({});
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

// app.post("/cards", async (req, res)=>{
//     try {
//         let card = Card.create({
//             name: req.body.name,
//             condition: req.body.condition,
//             price: req.body.price
//         });
//         res.status(201).json(card);
//     } catch (err) {
//         console.log(`could not create`, err);
//         res.status(500).json({message: `could not create`, err: err});
//     }
// });
app.post("/cards", async (req, res)=>{
    let sku;
    try {
        sku = await Sku.findOne({
            tcgid: req.body.tcg_id,
        });
        if (!sku) {
            sku = Sku.create({
                tcgid: req.body.tcg_id,
                name: req.body.name,
                set: req.body.set,
                locations: ['here'],
            });
            set_sku_uris(sku, req.body[image_uris][small], req.body[image_uris][normal], req.body[image_uris][large], req.body[image_uris][png], req.body[image_uris][boader_crop]);
            set_sku_prices(sku, req.body.usd, req.body.usd_foil);
            set_sku_quantity(sku);
            set_sku_art(sku);
        }
        sku = await Sku.findByIdAndUpdate(
            req.body.tcg_id,
            {
                $push: {
                    cards: {
                        location: 'here',
                        foil: false,
                        condition: req.body.condition,
                        price: 'price',
                        tcgid: req.body.tcg_id,
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
});
app.post("/orders", async (req, res)=>{
    try {
        let order = Order.create({
            number: req.body.number,
            price: req.body.price,
            direct: req.body.direct
        });
        res.status(201).json(order);
    } catch (err) {
        console.log(`could not create`, err);
        res.status(500).json({message: `could not create`, err: err});
    }
});
// app.patch("/cards/:id", async (req, res)=>{
//     let card;
//     try {
//         card = await Card.findByIdAndUpdate(req.params.id, req.body, {new: true});
//         if (!card) {
//             res.status(404).json({
//               message: "Card Not Found!",
//             });
//             return;
//         } else {
//             res.status(201).json(card);
//         }
//     } catch (err) {
//         console.log(`could not find`, err);
//         res.status(500).json({message: `could not create`, err: err});
//     }
// });
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

module.exports = {
    server: app
}