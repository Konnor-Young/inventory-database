const URL = `http://localhost:8080`;
const SEARCH_URL = `https://api.scryfall.com/cards/search?q=`;
const SEARCH_PARAM = `+unique%3Aprints`;

// vuetify: new Vuetify(),
var app = new Vue({
  vuetify: new Vuetify(),
  el: '#app',
  data: {
    message: 'HI WORLD',
    currentPage: 'Inventory',
    addCardSubPage: 'searchCard',
    addOrderSubPage: 'searchCard',
    updatingOrder: -1,
    updatingCard: -1,
    currentOrder: {},
    currentCard: {},
    cardList: [],
    orderList: [],
    cardFoil: false,
    cardCondition: false,
    cardLocationInput: '',
    orderNumber: '',
    directStatus: false,
    cardOrderObject: {},
    orderStatus: '',
    searchName: '',
    pages: ['Inventory', 'Add Card', 'View Orders', 'Add Order'],
    pileList: [],
    searchResults: [],
    loggedIn: true,
  },
  methods: {
    newCard: function (cardObject) {
      let id;
      if (cardObject.tcgplayer_id) {
        id = cardObject.tcgplayer_id;
      } else {
        id = cardObject.tcgplayer_etched_id;
      }
      let newCard = {
        tcg_id: id,
        name: cardObject.name,
        set: cardObject.set_name,
        image_uris: cardObject.image_uris,
        prices: cardObject.prices,
        condition: this.cardCondition,
        foil: this.cardFoil,
      };
      this.postCards(newCard);
    },
    newOrder: function () {
      let newOrder = {
        number: this.orderNumber,
        direct: this.directStatus,
        card: this.cardOrderObject,
      };
      this.postOrder(newOrder);
    },
    editOrder: function (order, order_index) {
      this.updatingOrder = order_index;
      this.currentOrder = order;
    },
    editCard: function (card, card_index) {
      this.updatingCard = card_index;
      this.currentCard = card;
    },
    //todo
    updateCard: function (card_id, sku_id) {
      let updatedCard = {
        location: this.cardLocationInput,
      };
      this.patchCard(updatedCard, card_id, sku_id);
    },
    updateOrder: function (order_id) {
      let updatedOrder = {
        status: this.orderStatus,
      };
      this.patchOrder(updatedOrder, order_id);
    },
    addToPile: function (item, qty, condition) {
      (item.quantity = 0), (item.foil = false);
      // {
      //     condition: "" ,
      //     foil: this.isFoil
      // };
      this.searchPile.push(newCard);
      this.addCardSubPage = 'pile';
    },
    getRandomCard: async function () {
      let response = await fetch(`https://api.scryfall.com/cards/random `, {
        method: 'GET',
      });
      let data = await response.json();
      this.searchResults.push(data);
      console.log(response.status);
      console.log(data);
    },
    getSearch: async function () {
      let response = await fetch(
        `${SEARCH_URL}${this.searchName}${SEARCH_PARAM}`
      );
      let data = await response.json();
      this.searchResults = data.data;

      // this.addCardSubPage = 'addToPile';
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
        credentials: 'include',
      });
      let data = await response.json();
      this.cardList = data;
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
        method: 'POST',
        body: JSON.stringify(card),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      let data = await response.json();
      console.log(response.status);
      console.log(data);
      if (response.status == 201) {
        this.getCards();
      }
    },
    patchCard: async function (update, card_id, sku_id) {
      let response = await fetch(`${URL}/skus/${sku_id}/cards/${card_id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      let data = await response.json();
      console.log(response.status);
      console.log(data);
      if (response.status == 201) {
        this.getCards();
      }
    },
    patchOrder: async function (update, order_id) {
      let response = await fetch(`${URL}/orders/${order_id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
        headers: {
          'Content-Type': 'application/json',
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
    deleteCard: async function (card_id, sku_id) {
      let response = await fetch(`${URL}/skus/${sku_id}/cards/${card_id}`, {
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
    deleteCard: async function (order_id) {
      let response = await fetch(`${URL}/orders/${order_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      let data = await response.json();
      console.log(response.status);
      console.log(data);
      if (response.status == 200) {
        this.getOrders();
      }
    },
    resetAddCardSearch: function () {
      this.searchResults = [];
    },
  },
  created: function () {
    this.getCards();
    this.getOrders();
  },
});
