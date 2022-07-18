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
-push inventory\*

## Endpoints

| _Front End_: |
| Method | description |
| ------------ | -------------------------------------------------------------------: |
| GET cards | (display inventory) |
| POST cards | (add card/cards) -- price cards as they are entered. |
| GET orders | (display orders) -- on button press update orders list from tcg store? |
| PATCH orders | (change order status) |
| POST orders | (add in-store order) |

| _Back End_: |
| Method | description |
| ----------- | ---------------: |
| GET orders | (from tcg store) |
| GET prices | (from mtgjson) |
| PATCH cards | (update prices) |
| POST cards | (to TCG) |

## Resources

Sku = [{
TCG_ID: " ",
Name: "card name",
Set: " ",
IMAGE_URIS: { Small: , Normal: , Large: , PNG: ,}
Prices: { }
Quantity: {Available: , Reserved: , Physical: },
Locations: [" "],
Cards: [{ }],
Store: {USER_ID},
Art: {Borderless: Bool, Textless: Bool, Etched: Bool, Full Art: Bool, Promo: Bool, Oversized: Bool}
}]
Card = [{
Location: " ",
Foil: bool,
Condition: " " ENUM,
Price: " ",
TCG_ID: " ",
Local_Image: " ",

}]
orders = [{
Number: " "
Direct: Bool
Cards: { }
Status: " " ENUM
}]

### Thoughts

We should add a trade-in page. Where you can process trades, show trade value, add cards to inventory, calculate store-credit/cash offer.
Cron to GET card prices / POST inventory overnight.
