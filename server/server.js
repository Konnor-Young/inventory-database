const express = require(`express`);
const app = express();
const cors = require(`cors`);
const { Card, Order, Unique, Storage } = require(`../persist/model`);
const logic = require(`../persist/location`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));
app.use(cors())

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
        await logic.getPrice(card);
        // console.log(card);
        // console.log(card.price);
        await card.save();
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

app.post("/locations", async (req, res) => {
    let list
    try {
        list = await logic.getOpenLocations(req.body.number);
        // console.log(list);
    } catch (err) {
        // console.log(list);
        console.log(err);
        res.status(500).json({ message: `something went wrong. found no location`, err: err });
    }
    res.status(200).json(list);
});

app.post("/cards", async (req, res) => {
    let unique;
    let card;
    let storage;
    let isFoil;
    if (req.body.foil == 'Non-Foil') {
        isFoil = false
    } else { isFoil = true }
    console.log(req.body.foil);
    try {
        card = await Card.create({
            location: req.body.location,
            foil: isFoil,
            condition: req.body.condition,
            price: 'price',
            tcg_id: req.body.tcg_id,
            local_image: req.body.image_uris.small
        });
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
                price: { usd: req.body.prices.usd, usd_foil: req.body.prices.usd_foil, usd_etched: req.body.prices.usd_etched},
                quantity: { available: 0, reserved: 0, physical: 0 },
                locations: { NM: {quantity: 0}, LP: {quantity: 0}, MP: {quantity: 0}, HP: {quantity: 0}, DMG: {quantity: 0}, NMfoil: {quantity: 0}, LPfoil: {quantity: 0}, MPfoil: {quantity: 0}, HPfoil: {quantity: 0}, DMGfoil: {quantity: 0}},
            });
        }
        await logic.getPrice(card);
        await card.save();
        const number = card.location;
        const sentence = number.toString();
        const index = 0;
        const shelf = 's' + sentence.charAt(index);
        const drawer = 'd' + sentence.charAt(index + 1);
        const box = 'b' + sentence.charAt(index + 2);
        let newBox = await Storage.findById('62de035bfc0fa0f397501d7f');
        let updateBox = await newBox.locationMap.get(shelf);
        updateBox[drawer][box] = updateBox[drawer][box] + 1;
        storage = await Storage.findByIdAndUpdate(newBox._id, newBox);
        updateAvailable = unique.quantity.get('available') + 1;
        updatePhysical = unique.quantity.get('physical') + 1;
        unique = await Unique.findByIdAndUpdate(
            unique._id,
            {
                $set: {
                    "quantity.available": updateAvailable,
                    "quantity.physical": updatePhysical
                },
                $push: {
                    cards: card._id
                }
            }
        );
        // set conditions as empty objects and update conditions with locations as they are added
        let filter;
        if(card.foil){
            filter = card.condition+'foil';
        }else{
            filter = card.condition;
        }
        console.log(filter);
        updateSku = await Unique.findById(unique._id);
        // console.log(updateSku, `pre`);
        // console.log(updateSku.locations.get(filter));
        let updateSkuLocations = updateSku.locations.get(filter);
        let pushLocation = sentence.charAt(index) + sentence.charAt(index+1) + sentence.charAt(index+2);
        if(updateSkuLocations.quantity === undefined){
            updateSkuLocations.quantity = 1;
        }else{
            updateSkuLocations.quantity += 1;
        }
        // console.log(updateSkuLocations);
        // console.log(updateSkuLocations[pushLocation]);
        if(updateSkuLocations[pushLocation] == undefined){
            updateSkuLocations[pushLocation] = {quantity: 1, cards: [card._id]};
            // console.log(updateSkuLocations);
        }else{
            updateSkuLocations[pushLocation]['cards'].push(card._id);
            if(updateSkuLocations[pushLocation].quantity === undefined){
                updateSkuLocations[pushLocation].quantity = 1;
            }else{
                updateSkuLocations[pushLocation].quantity += 1;
            }
            // console.log(updateSkuLocations);
        }
        // console.log(updateSkuLocations, `post`);
        await updateSku.locations.set(filter, updateSkuLocations);
        await updateSku.save();
        // console.log(updateSku, `post`);
        unique = await Unique.findByIdAndUpdate(unique._id, updateSku, {new: true});
        // console.log(unique, `post post`);
        // console.log(unique.locations.get(filter));
    } catch (err) {
        console.log(`could not create`, err);
        res.status(500).json({ message: `could not create`, err: err });
        return;
    }
    res.status(200).json(unique);
});

app.post("/orders", async (req, res) => {
    let order;
    try {
        order = Order.create({
            number: req.body.number,
            direct: req.body.direct,
            cards: req.body.cards,
            status: 'standing',
        });
        // var cardList = req.body.cards;
        for (let i in req.body.cards) {
            let unique = await Unique.findOne({ tcg_id: req.body.cards[i].card });
            console.log(unique.quantity.get("available"));
            console.log(req.body.cards[i].quantity)


            if (unique.quantity.get("available") < req.body.cards[i].quantity) {
                console.log('cards not available: ', "Available: ", unique.quantity.get("available"), "Requested: ", req.body.cards[i].quantity);
                return;
            }

            //subtract the quantity of the card in the order with the available quantity in the sku
            unique.quantity.set('available', unique.quantity.get("available") - req.body.cards[i].quantity);
            await unique.save();


            //add the quantity to reserved
            unique.quantity.set('reserved', unique.quantity.get("reserved") + req.body.cards[i].quantity);
            await unique.save();
            console.log(unique.quantity.get("available"));
            console.log(unique.quantity.get("reserved"));
        }
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
    let storage;
    try {
        card = await Card.findById(req.params.id)

        const number = card.location;
        const newNumber = req.body.location;
        const sentence = number.toString();
        const newSentence = newNumber.toString();
        const results = await Storage.findOne();

        const index = 0;
        const newShelf = 's' + newSentence.charAt(index);
        const newDrawer = 'd' + newSentence.charAt(index + 1);
        const movingBox = 'b' + newSentence.charAt(index + 2);
        let newBox = await Storage.findById(results._id);
        let updateNewBox = await newBox.locationMap.get(newShelf);

        const shelf = 's' + sentence.charAt(index);
        const drawer = 'd' + sentence.charAt(index + 1);
        const box = 'b' + sentence.charAt(index + 2);
        let currentBox = await Storage.findById(results._id);
        let updateCurrentBox = await currentBox.locationMap.get(shelf);

        if (updateCurrentBox[drawer][box] > 0) {
            updateCurrentBox[drawer][box] = updateCurrentBox[drawer][box] - 1;
            storage = await Storage.findByIdAndUpdate(currentBox._id, currentBox);
        } else {
            console.log('error cannot find card at location ', updateCurrentBox[drawer][box]);
            return;
        }
        updateNewBox[newDrawer][movingBox] = updateNewBox[newDrawer][movingBox] + 1;
        storage = await Storage.findByIdAndUpdate(newBox._id, newBox);

        console.log(newBox);
        console.log(currentBox);

        card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!card) {
            res.status(404).json({
                message: "Card Not Found!",
            });
            return;
        }
        let pushLocation = newSentence.charAt(index) + newSentence.charAt(index + 1) + newSentence.charAt(index + 2);
        let pullLocation = sentence.charAt(index) + sentence.charAt(index + 1) + sentence.charAt(index + 2);
        let filter;
        if(card.foil){
            filter = card.condition+'foil';
        }else{
            filter = card.condition;
        }
        updateSku = await Unique.findOne({tcg_id: card.tcg_id});
        // console.log(updateSku, `pre`);
        // console.log(updateSku.locations.get(filter));
        let updateSkuLocations = updateSku.locations.get(filter);
        if(updateSkuLocations[pushLocation] == undefined){
            updateSkuLocations[pushLocation] = {quantity: 1, cards: [card._id]};
            // console.log(updateSkuLocations);
        }else{
            updateSkuLocations[pushLocation]['cards'].push(card._id);
            if(updateSkuLocations[pushLocation].quantity === undefined){
                updateSkuLocations[pushLocation].quantity = 1;
            }else{
                updateSkuLocations[pushLocation].quantity += 1;
            }
            // console.log(updateSkuLocations);
        }
        updateSkuLocations[pullLocation].quantity -= 1;
        let cardIndex = updateSkuLocations[pullLocation]['cards'].indexOf(card._id);
        updateSkuLocations[pullLocation]['cards'].splice(cardIndex, 1);
        // console.log(updateSku);
        // console.log(updateSkuLocations, `post`);
        await updateSku.locations.set(filter, updateSkuLocations);
        await updateSku.save();
        // console.log(updateSku, `post`);
        unique = await Unique.findOneAndUpdate({tcg_id: card.tcg_id}, updateSku, {new: true});
        // console.log(unique, `post post`);
        // console.log(unique.locations.get(filter));
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
        console.log(order);
        if (req.body.status == 'pulling'){
            await logic.allocateCards(order);
            await order.save()
        }
        console.log(order);
        if(req.body.status == 'shipped'){
            for (let i = 0; i < order.cards.length; i++) {
                // console.log(order.cards[i].quantity);
                let unique = await Unique.findOne({ tcg_id: order.cards[i].card });

                if (unique.quantity.get("available") < order.cards[i].quantity) {
                    console.log('cards not available: ', "Available: ", unique.quantity.get("available"), "Requested: ", order.cards[i].quantity);
                    return;
                }
                //subtract to remove physical and reserved from inventory when moving orders to 'shipped' status
                unique.quantity.set('physical', unique.quantity.get("physical") - order.cards[i].quantity);
                await unique.save();
            
                unique.quantity.set('reserved', unique.quantity.get("reserved") - order.cards[i].quantity);
                await unique.save();

                console.log(unique.quantity.get("available"));
                console.log(unique.quantity.get("reserved"));

            }
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