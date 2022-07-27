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
    // console.log(unique);
    // console.log(card);
    // console.log(unique.price);
    // console.log(card.price);
    if(card.foil){
        card.price = unique.price.get('usd_foil');
    }else{
        card.price = unique.price.get('usd');
    }
    // console.log(card.price);
};
async function updateAllPrices() { //Cards.find => cards.forEach getPrice(card)
    let allCards = await Card.find({});
    allCards.forEach(card => {
        getPrice(card);
    });
};
async function getOpenLocations(numberOfCards){ //Locations.findOne(store id) for ([key, value] of Object.entries(storage.locationMap)) 
    var openingList = {};
    let storage = await Storage.findOne();
    // console.log(storage);
    var map1 = storage.get('locationMap');
    var shelfContents = map1.values();
    var b = 1;
    var d = 1;
    var s = 1;
    for(var shelf of shelfContents){
        if(s > storage.shelves){s = 1;}
        for(var [key, value] of Object.entries(shelf)) {
            if(d > storage.drawers){d = 1;}
            var drawer = value;
            for(var [key, value] of Object.entries(drawer)){
                if(b > storage.boxes){b = 1;}
                let open = 150 - value;
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
    var eq = false;
    var gt = false;
    var lt = false;
    for(var [key, value] of Object.entries(openingList)){
        var open = 0;
        var eqList = [];
        var gtList = [];
        var ltList = [];
        if(value == numberOfCards){
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
        for(let j=0; j<numberOfCards; j++){
            min++;
            locate_list[j] = min;
        }
    }else if(gt){
        open_key = gtList[0];
        // console.log(open_key, `key`);
        open_value = openingList[open_key];
        // console.log(open_value, `value`);
        let i = parseInt(open_key);
        // console.log(i, `i`);
        min = (i*1000)+(150-open_value);
        // console.log(min, `min`);
        // pushForward(key);
        for(let j=0; j<numberOfCards; j++){
            min++;
            locate_list[j] = min;
        }
    }else if(lt){
        var allocate = 0;
        for(let x = 0; x < ltList.length; x++){
            open_key = ltList[x];
            open_value = openingList.open_key;
            let i = parseInt(open_key);
            min = (i*1000)+(150-open_value);
            max = (i*1000)+150;
            // pushForward(key);
            for(let j = min; j<=max; j++){
                min++;
                locate_list.push(min);
                allocate++;
                if(allocate == numberOfCards){
                    break;
                }
            }
        }
    }
    // console.log(locate_list);
    return locate_list;
    // iterate through openingList and find a # of openings pushForward(key) return parseInt(key)*1000+(150-#)->parseInt(key)*1000+150
};
async function pushForward(box){ // first three numbers in location ie 123--- Card.find({location})
    let i = parseInt(box);
    let min = i*1000;
    let max = (i*1000)+150;
    let cardsInBox = await Card.find({
        $and: [{$gt: {location: min}},
            {$lte: {location: max}}]
    });
    let j = 0;
    for(item of cardsInBox){
        item.location = (j+min);
        await item.save();
        j++;
    }
};
async function allocateCards(order){
    console.log(order, `order`);
    var order_id = order._id;
    for(item of order.cards){
        var sku_id = {tcg_id: item.card};
        console.log(sku_id, `sku_id`);
        let cond = item.condition;
        let foil = item.foil;
        var needed = item.quantity;
        var search;
        if(foil){
            search = cond + 'foil';
        }else{
            search = cond;
        }
        var sku = await Unique.findOne(sku_id);
        console.log(sku, `sku`);
        var forAllocation = sku.locations.get(search);
        console.log(forAllocation);
        var eq = false;
        var gt = false;
        var lt = false;
        var returnLocation;
        var returnIds;
        var ltList = [];
        for([key, value] of Object.entries(forAllocation)){
            if(key == 'quantity'){continue;}
            if(needed > 0){
                if(value.quantity == item.quantity){
                    eq = true;
                    needed -= value.quantity;
                    returnLocation = key;
                    returnIds = value.cards;
                    console.log(returnLocation, `eq location`);
                    console.log(returnIds, `eq ids`);
                }else if(value.quantity > item.quantity){
                    gt = true;
                    needed -= value.quantity;
                    returnLocation = key;
                    returnIds = value.cards;
                    console.log(returnLocation, `gt location`);
                    console.log(returnIds, `gt ids`);
                }else if(value.quantity < item.quantity){
                    if(!lt){
                        let quantityNow = needed - value.quantity;
                        if(quantityNow > 0){
                            returnIds = value.cards;
                            ltList[key] = {quantity: value.quantity, ids: returnIds}
                        }else{
                            returnIds = value.cards;
                            ltList[key] = {quantity: needed, ids: returnIds}
                        }
                        needed = needed - value.quantity;
                        console.log(ltList, `lt location`);
                        console.log(returnIds, `lt ids`);
                        if(needed <= 0){
                            lt = true;
                        }
                    }
                }
            }else{break;}
            if(eq || gt){
                await Order.findByIdAndUpdate(order_id, {
                    $push: {
                        locations: {
                            box: returnLocation,
                            quantity: item.quantity,
                            name: sku.name,
                            ids: returnIds,
                            condition: item.condition,
                            foil: item.foil
                        }
                    }
                })
            }else if(lt){
                for([key, value] of Object.entries(ltList)){
                    await Order.findByIdAndUpdate(order_id, {
                        $push: {
                            locations: {
                                box: key,
                                quantity: value.quantity,
                                name: sku.name,
                                ids: value.ids,
                                condition: item.condition,
                                foil: item.foil
                            }
                        }
                    })
                }
            }
        }
    }
    console.log(order.locations);
};
// async function test(){
//     let trial = await Order.findOne({number: "i really really am sorry "});
//     console.log(trial, `pre`);
//     allocateCards(trial);
// }
module.exports = {
    initializeStorage,
    getOpenLocations,
    getPrice,
    updateAllPrices,
    allocateCards,
}


