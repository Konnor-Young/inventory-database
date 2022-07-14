const { response } = require("express");

const URL = 'http://localhost:8080';
// vuetify: new Vuetify(),
var app = new Vue({
    el: '#app',
    data: {
        message: "HI WORLD",
        currentPage: "Inventory",
        addCardSubPage: "searchCard",
        addOrderSubPage: "searchCard",
        cardList: [],
        orderList: [],
        cardNameInput: "",
        cardPriceInput: "",
        cardConditionInput: "",
        orderNumber: 0,
        orderPrice: '',
        directStatus: false,
    },
    methods: {
        getOrders: async function () {
            let response = await fetch(`${URL}/orders`, {
                method: 'GET',
                credentials: 'include',
            });

            let data = await response.json();
            this.orderList = data;
            console.log(response.status);
            console.log(data);
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
        },
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
            let response = await fetch(`${URL}/cards/card_id`, {
                method: "PATCH",
                body: JSON.stringify(update),
                headers: {
                    "Content Type": "application/json"
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
        updateCard: function (card_id) {
            let updatedCard = {
                condition: this.cardConditionInput
            }
            this.patchCard(updatedCard, card_id);
        },
    },
    created: function () {
        this.getCards();
        this.getOrders();
    },
});
