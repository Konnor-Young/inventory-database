const e = require("express");
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
async function getOpenLocations(numberOfCards){ //Locations.findOne(store id) for ([key, value] of Object.entries(storage.locationMap)) 
    var openingList = {};
    let storage = await Storage.find({shelves: 1});
    var map1 = storage[0].get('locationMap');
    var shelfContents = map1.values();
    var b = 1;
    var d = 1;
    var s = 1;
    for(var shelf of shelfContents){
        if(s > storage[0].shelves){s = 1;}
        // console.log(`shelf`, shelf);
        for(var [key, value] of Object.entries(shelf)) {
            if(d > storage[0].drawers){d = 1;}
            var drawer = value;
            // console.log(drawer);
            for(var [key, value] of Object.entries(drawer)){
                if(b > storage[0].boxes){b = 1;}
                let open = 150 - value;
                // console.log(open);
                if(open >= 20){
                    openingList[`${s}${d}${b}`] = open;
                }
                b++;
            }
            d++;
        }
        s++;
    }
    // console.log(openingList);
    for(var [key, value] of Object.entries(openingList)){
        if(value >= numberOfCards){
            let thisNumber = parseInt(key);
            var min = (thisNumber*1000)+(150-numberOfCards);
            var max = min+numberOfCards;
            // pushForward(key);
            var returnList = [];
            for(min; min<=max; min++){
                returnList.push(min);
            }
        }
    }
    console.log(returnList);
    // return returnList;
    // iterate through openingList and find a # of openings pushForward(key) return parseInt(key)*1000+(150-#)->parseInt(key)*1000+150
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
        await cardsInBox[j].save();
    }
};

module.exports = {
    initializeStorage,
    getOpenLocations
}




for(var [key, value] of Object.entries(openingList)){
    var open = 0;
    var eqList = [];
    var gtList = [];
    var ltList = [];
    var eq = false;
    var gt = false;
    var lt = false;
    if(value = numberOfCards){
        eq = true; 
        eqList.push(key);
    }else if(value > numberOfCards){
        gt = true;
        gtList.push(key);
    }
    else if(value < numberOfCards){
        if(!lt){
            ltList.push(key);
            open += value;
            if(open >= numberOfCards){
                lt = true;
            }
        }
    }
}
var locate_list = [];
var open_key;
var open_value;
var min;
var max;
if(eq){
    open_key = eqList[0];
    open_value = openingList.open_key;
    let i = parseInt(open_key);
    min = (i*1000)+(150-open_value);
    // pushForward(key);
    for(let j=1; j<=numberOfCards; j++){
        min++;
        locate_list[j] = min;
    }
    return locate_list;
}else if(gt){
    open_key = gtList[0];
    open_value = openingList.open_key;
    let i = parseInt(open_key);
    min = (i*1000)+(150-open_value);
    // pushForward(key);
    for(let j=1; j<=numberOfCards; j++){
        min++;
        locate_list[j] = min;
    }
    return locate_list;
}else if(lt){
    for(let x = 0; x < ltList.length; x++){
        open_key = ltList[x];
        open_value = openingList.open_key;
        let i = parseInt(open_key);
        min = (i*1000)+(150-open_value);
        max = (i*1000)+150;
        for(let j = min; j<=max; j++){
            min++;
            locate_list.push(min);
        }
    }
}
