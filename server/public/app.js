const URL = `http://localhost:8080`;
const SEARCH_URL = `https://api.scryfall.com/cards/search?q=`
const SEARCH_PARAM = `+unique%3Aprints`

// vuetify: new Vuetify(),
var app = new Vue({
    el: '#app',
    data: {
        message: "HI WORLD",
        currentPage: "Inventory",
        addCardSubPage: "searchCard",
        addOrderSubPage: "searchCard",
        updatingOrder: -1,
        updatingCard: -1,
        currentOrder: {},
        currentCard: {},
        cardList: [],
        orderList: [],
        cardNameInput: "",
        cardPriceInput: "",
        cardConditionInput: "",
        orderNumber: 0,
        orderPrice: '',
        directStatus: false,
        isFoil: false,
        searchName: '',
        searchResults: [],
        searchPile: [],
    },
    methods: {
        newCard: function () {
            let newCard = {
                name: this.cardNameInput,
                condition: this.cardConditionInput,
                price: this.cardPriceInput
            };
            this.postCards(newCard);
        },
        newOrder: function () {
            let newOrder = {
                number: this.orderNumber,
                price: this.orderPrice,
                direct: this.directStatus,
            };
            this.postOrder(newOrder);
        },
        editOrder: function (order, order_index) {
            this.updatingOrder = order_index;
            this.currentOrder = order;
        },
        editCard: function (card, card_index){
            this.updatingCard = card_index;
            this.currentCard = card;
        },
        updateCard: function (card_id) {
            let updatedCard = {
                condition: this.cardConditionInput
            };
            this.patchCard(updatedCard, card_id);
        },
        updateOrder: function (order_id) {
            let updatedOrder = {
              number: this.orderNumber,
            };
            this.patchOrder(updatedOrder, order_id);
        },
        addToPile: function (card) {
            let newCard = {
                name: card.name,
                location: 'generated',
                foil: this.isFoil
            };
            this.searchPile.push(newCard);
            this.addCardSubPage = pile;
        },
        getSearch: async function () {
            let response = await fetch(`${SEARCH_URL}${this.searchName}${SEARCH_PARAM}`);
            let data = await response.json();
            this.searchResults = data.data;
            this.addCardSubPage = 'addToPile';
        },
        getOrders: async function () {
            let response = await fetch(`${URL}/orders`, {
                method: 'GET',
                credentials: 'include',
            });
            let data = await response.json();
            this.orderList = data;
            console.log(response.status);
            console.log(data);
            this.updatingOrder = -1;
        },
        getCards: async function () {
            let response = await fetch(`${URL}/cards`, {
                method: 'GET',
                credentials: "include",
            });
            let data = await response.json();
            this.cardList = data
            console.log(response.status);
            console.log(data);
            this.updatingCard = -1;
        },
        postOrder: async function (order) {
            let response = await fetch(`${URL}/orders`, {
                method: 'POST',
                body: JSON.stringify(order),
                headers: {
                    'content-type': 'application/json',
                },
                credentials: 'include',
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if (response.status == 201) {
                this.getOrders();
            }
        },
        postCards: async function (card) {
            let response = await fetch(`${URL}/cards`, {
                method: "POST",
                body: JSON.stringify(card),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if (response.status == 201) {
                this.getCards();
            }
        },
        patchCard: async function (update, card_id) {
            let response = await fetch(`${URL}/cards/${card_id}`, {
                method: "PATCH",
                body: JSON.stringify(update),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if (response.status == 201) {
                this.getCards()
            }
        },
        patchOrder: async function (update, order_id) {
            let response = await fetch(`${URL}/orders/${order_id}`, {
                method: 'PATCH',
                body: JSON.stringify(update),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if (response.status == 201) {
                this.getOrders();
            }
        },
        deleteCard: async function (card_id) {
            let response = await fetch(`${URL}/cards/${card_id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if (response.status == 200) {
                this.getCards();
            }
        },
    },
    created: function () {
        this.getCards();
        this.getOrders();
    },
});
