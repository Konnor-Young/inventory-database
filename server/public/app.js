const URL = 'http://localhost:8080';

new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    message: 'HI WORLD',
    currentPage: 'Inventory',
    addCardSubPage: 'searchCard',
    addOrderSubPage: 'searchCard',
    cardList: ['test', 'Test'],
    orderList: ['order1', 'order2'],
    // viewInventory: false,
    // viewOrders: false,
    // addCard: false,
    // searchCard: false,
    // addToPile: false,
    // pile: false,
  },
  methods: {
    getCards: async function () {
      let response = await fetch(`${URL}/cards`, {
        method: 'GET',
        credentials: 'include',
      });

      let data = await response.json();
      console.log(data);
      console.log(this.cardList);
    },
    // getOrders: async function () {
    //   let response = await fetch(`${URL}/orders`, {
    //     method: 'GET',
    //     credentials: 'include',
    //   });

    //   let data = await response.json();
    //   console.log(data);
    //   console.log(this.orderList);
    // },
    getOrders: function () {
      console.log('button working');
    },
  },
});
