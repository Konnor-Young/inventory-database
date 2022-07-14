const URL = 'http://localhost:8080';
// vuetify: new Vuetify(),
var app = new Vue({
  el: '#app',
  data: {
    message: 'HI WORLD',
    currentPage: 'Inventory',
    addCardSubPage: 'searchCard',
    addOrderSubPage: 'searchCard',
    cardList: [],
    orderList: [],
    orderNumber: 0,
    orderPrice: '',
    directStatus: false,
  },
  methods: {
    getCards: async function () {
      let response = await fetch(`${URL}/cards`, {
        method: 'GET',
        credentials: 'include',
      });

      let data = await response.json();
      this.cardList = data;
      console.log(data);
      console.log(this.cardList);
    },
    getOrders: async function () {
      let response = await fetch(`${URL}/orders`, {
        method: 'GET',
        credentials: 'include',
      });

      let data = await response.json();
      this.orderList = data;
      console.log(data);
      console.log(this.orderList);
    },
    newOrder: function () {
      let newOrder = {
        number: this.orderNumber,
        price: this.orderPrice,
        direct: this.directStatus,
      };

      this.postOrder(order);
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
      if (response.status == 200) {
        this.getOrders();
      }
    },
    created: function () {
      this.getCards();
      this.getOrders();
    },
  },
});
