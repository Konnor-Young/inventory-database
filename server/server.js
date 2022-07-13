const express = require(`express`);
const app = express();
const cors = require(`cors`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.get("/cards", async (req, res) => {
    let cardList;
    try {
        cardList = await Card.find({});
    } catch (err) {
        console.log('could not find card list', err);
        res.status(500).json({ message: 'cards not found', err: err });
    }
})

app.get("/orders", async (req, res) => {
    let orderList;
    try { } catch (err) {
        console.log(`could not find orders`, err);
        res.status(500).json({ message: `orders not found`, err: err });
    }
})

module.exports = {
    server: app
}