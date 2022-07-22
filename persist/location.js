const { Card, Order, Unique, Storage } = require(`./model`);

async function initializeStorage(shelves, drawers, boxes) {
    var locations = {};
    for(var i=1; i<=shelves; i++){
        var shelf = `s${i}`;
        // console.log(i);
        locations[shelf] = {};
        for(var j=1; j<=drawers; j++){
            var drawer = `d${j}`;
            // console.log(j);
            locations[shelf][drawer] = {};
            for(var k=1; k<=boxes; k++){
                var box = `b${k}`;
                // console.log(k);
                // console.log(shelf, drawer, box);
                locations[shelf][drawer][box] = 0;
            }
        }
    }
    // console.log(locations);
    // console.log(shelves);
    // console.log(drawers);
    // console.log(boxes);
    let storage = await Storage.create({
        locationMap: locations,
        shelves: shelves,
        drawers: drawers,
        boxes: boxes
    });
    // console.log(storage);
};
async function getPrice(card) { //Unique.findOne(tcg_id) if card foil card.price = unique.prices.usd_foil else card.price = unique.prices.usd
    let unique = await Unique.findOne({tcg_id: card.tcg_id});
    if(card.foil){
        card.price = unique.price.get('usd_foil');
    }else{
        card.price = unique.price.get('usd');
    }
    await card.save();
};
async function updateAllPrices() { //Cards.find => cards.forEach getPrice(card)
    let allCards = await Card.find({});
    allCards.forEach(card => {
        getPrice(card);
    });
};
async function getOpenLocations(){ //Locations.findOne(store id) for ([key, value] of Object.entries(storage.locationMap)) 
    var openingList = [];
    let storage = await Storage.find({shelves: 1});
    console.log(storage);
    var map1 = storage[0].get('locationMap');
    console.log(map1);
    var shelfList = map1.values();
    // console.log(shelfList)
    for(var shelf of shelfList){
        console.log(`shelf`, shelf);
        var drawerList = shelf.values();
        // console.log(`shelves`, shelves);
        for(drawer of drawerList){
            console.log(`drawer`, drawer);
            var boxList = drawer.values();
            // console.log(`drawers`, drawers);
            for(box of boxList){
                console.log(`box`, box);
                // console.log(`boxes`, boxes);
            }
        }
    }
};
async function pushForward(box){ // first three numbers in location ie 123--- Card.find({location})
    let i = parseInt(box);
    let min = i*1000;
    let max = (i*1000)+150;
    let cardsInBox = await Card.find({}, {
        $and: [{location: {$gt: min}},
            {location: {$lte: max}}]
    });
    for(let j=1; j<=cardsInBox.length(); j++){
        cardsInBox[j].location = (j+min);
    }
};

module.exports = {
    initializeStorage,
    getOpenLocations
}