const { response } = require("express");

const URL = "http://localhost:8080"
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
    },
    methods: {
        getCards: async function () {
            let response = await fetch(`${URL}/cards`, {
                method: "GET",
                credentials: "include"
            });

            let data = await response.json();
            this.cardList = data;
            console.log(data);
            console.log(this.cardList);
        },
        getOrders: async function () {
            let response = await fetch(`${URL}/orders`, {
                method: "GET",
                credentials: "include"
            });

            let data = await response.json();
            this.orderList = data;
            console.log(data);
            console.log(this.orderList);
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
            if (response.status == 200) {
                this.getCards();
            }
        },
        newCard: function () {
            let newCard = {
                name: this.cardNameInput,
                condition: this.cardConditionInput,
                price: this.cardPriceInput
            }
            console.log(newCard);
            this.postCards(newCard);
        }
    },
    created: function () {
        this.getCards();
        this.getOrders();
    },
});