const express = require(`express`);
const app = express();
const cors = require(`cors`);

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
        orderList = await orderList.find({});
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

module.exports = {
    server: app
}