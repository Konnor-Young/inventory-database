

new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        message: "HI WORLD",
        currentPage: "View Inventory",
        addCardSubPage: "searchCard",
        addOrderSubPage: "searchCard",
        // viewInventory: false,
        // viewOrders: false,
        // addCard: false,
        // searchCard: false,
        // addToPile: false,
        // pile: false,
    },
    methods: {
        goToViewInventory: function () {
            this
        },
    
        goToAddCard: function () {
            this.addCard = true;
        },
    },
});