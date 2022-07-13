# inventory-database

Inventory control app for TCG's

Un named project for Code School 2022. App uses logic to add cards to inventory and pull when orders come in.

MVP:
    -insert cards
    -remove cards
    -receive orders
    -pull order
    -'ship' order
    -view orders
    -view inventory
    -push inventory*

## Endpoints

| _Front End_: |
| Method       | description                                                             |
| ------------ |   -------------------------------------------------------------------:  |
| GET cards    | (display inventory)                                                     |
| POST cards   | (add card/cards) -- price cards as they are entered.                    |
| GET orders   | (display orders)  -- on button press update orders list from tcg store? |
| PATCH orders | (change order status)                                                   |
| POST orders  | (add in-store order)                                                    |

| _Back End_: |
| Method      | description      |
| ----------- | ---------------: |
| GET orders  | (from tcg store) |
| GET prices  | (from mtgjson)   |
| PATCH cards | (update prices)  |
| POST cards  | (to TCG)         |

## Resources

cards = [{
    _ID: unique number,
    Name: card name,
    Game: MTG (enum),
    Condition: NM - LP - MP - HP - Damaged (enum),
    Style: Foil, Borderless, Showcase
    sku: GET tcg sku,
    price: GET price,
    Location: index #?,
    Store?: store's uuid,
}]
orders = [{
    _ID: unique number,
    Name: customer name,
    Direct: boolean,
    Status: Standing - Pulling - Shipped (enum),
    Store?: store's uuid,
    Actual Order Info: { GET order from tcg },
    Timestamp: (to delete old shipped orders),
}]

### Thoughts

We should add a trade-in page. Where you can process trades, show trade value, add cards to inventory, calculate store-credit/cash offer.
Cron to GET card prices / POST inventory overnight.
