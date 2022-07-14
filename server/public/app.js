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
    },
    created: function () {
        this.getCards();
        this.getOrders();
    },
});