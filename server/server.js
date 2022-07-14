const express = require(`express`);
const app = express();
const cors = require(`cors`);
const { Card, Order } = require(`../persist/model`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.get("/cards", async (req, res)=>{
    let cardList;
    try {
        cardList = await Card.find({});
    } catch (err) {
        console.log('could not find card list', err);
        res.status(500).json({message: 'cards not found', err: err});
    }
    res.status(200).json(cardList);
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
    try {
        let card = Card.create({
            name: req.body.name,
            condition: req.body.condition,
            price: req.body.price
        });
        res.status(201).json(card);
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
        card = Card.findByIdAndDelete(req.params.id);
        if(!card){
            res.status(404).json({message: `card not found`});
            return;
        }
    }catch(err){
        console.log(`could not delete`, err);
        res.status(500).json({message: `could not delete`, err: err});
    }
    res.status(200).json(card);
});

module.exports = {
    server: app
}