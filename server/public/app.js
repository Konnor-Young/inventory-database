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
    tableFilters: ['active', 'standing', 'pulling', 'shipped'],
    currentTable: 'active',
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
    createCardForPile: function (card, condition) {
      card.condition = condition;
      return card;
    },
    addToPile: function (item) {
      // item.foil = foil;
      var conditions = ['NM', 'LP', 'MP', 'HP', 'DMG'];
      // var cards = this.createCardForPile(item, "DMG", item.totalConditions.DMG);
      // console.log(cards);
      // this.pileList.push(cards)

      for (let i in conditions) {
        let condition = conditions[i];

        if (item.totalConditions[condition] > 0) {
          var card = this.createCardForPile(item, condition);
          var qty = item.totalConditions[condition];
          for (let j = 0; j < qty; j++) {
            this.pileList.push(card);
          }
        }
      }
      item.totalConditions = {
        NM: 0,
        LP: 0,
        MP: 0,
        HP: 0,
        DMG: 0,
      };

      // {
      //     condition: "" ,
      //     foil: this.isFoil
      // };
      // this.searchPile.push(newCard);
      // this.addCardSubPage = 'pile';
    },
    getRandomCard: async function () {
      let response = await fetch(`https://api.scryfall.com/cards/random `, {
        method: 'GET',
      });
      let data = await response.json();
      this.searchResults.push(data);
    },
    getSearch: async function () {
      let response = await fetch(
        `${SEARCH_URL}${this.searchName}${SEARCH_PARAM}`
      );
      let data = await response.json();
      console.log(data.data);
      data.data.splice(24);
      console.log(data.data);
      data.data.forEach((item) => {
        item.totalConditions = {
          NM: 0,
          LP: 0,
          MP: 0,
          HP: 0,
          DMG: 0,
        };
        item.totalCards = 0;
      });

      this.searchResults = data.data;
    },
    getSmallImgURI: function (cardObject) {
      if (cardObject.layout == 'normal') {
        // Normal small image uri
        if (cardObject.image_uris.small == 'null') {
          return 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pokemon_Trading_Card_Game_cardback.jpg';
        } else {
          return cardObject.image_uris.small;
        }
      } else if (cardObject.layout == 'modal_dfc') {
        // If modal_dfc
        return cardObject.card_faces[0].image_uris.small;
      } else if (cardObject.layout == 'transform') {
        // If transfrom
        return 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pokemon_Trading_Card_Game_cardback.jpg';
      } else if (cardObject.layout == 'meld') {
        return 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pokemon_Trading_Card_Game_cardback.jpg';
      } else {
        return 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pokemon_Trading_Card_Game_cardback.jpg';
      }
    },
    // Counter Functions for AddtoPile
    //---- Adding to the Condition total + the totalCards
    addLPtoObject: function (cardObject) {
      cardObject.totalConditions.LP++;
      cardObject.totalCards++;
    },
    addNMtoObject: function (cardObject) {
      cardObject.totalConditions.NM++;
      cardObject.totalCards++;
    },
    addMPtoObject: function (cardObject) {
      cardObject.totalConditions.MP++;
      cardObject.totalCards++;
    },
    addHPtoObject: function (cardObject) {
      cardObject.totalConditions.HP++;
      cardObject.totalCards++;
    },
    addDMGtoObject: function (cardObject) {
      cardObject.totalConditions.DMG++;
      cardObject.totalCards++;
    },
    // ==== Subtracting 2 on ctrl + click (work around for intial click also adding 1)
    removeLPtoObject: function (cardObject) {
      cardObject.totalConditions.LP -= 2;
      cardObject.totalCards -= 2;
    },
    removeNMtoObject: function (cardObject) {
      cardObject.totalConditions.NM -= 2;
      cardObject.totalCards -= 2;
    },
    removeMPtoObject: function (cardObject) {
      cardObject.totalConditions.MP -= 2;
      cardObject.totalCards -= 2;
    },
    removeHPtoObject: function (cardObject) {
      cardObject.totalConditions.HP -= 2;
      cardObject.totalCards -= 2;
    },
    removeDMGtoObject: function (cardObject) {
      cardObject.totalConditions.DMG -= 2;
      cardObject.totalCards -= 2;
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
    resetAddCardSearch: function () {
      this.searchResults = [];
    },
    focusOntoSearch: function () {
      console.log(this.$refs.searchInput);
      const searchButtonRef = this.$refs.searchInput;
      searchButtonRef.focus();
    },

    // ====order filter====

    checkOrder: function (order) {
      if (order.status == this.currentTable) {
        return true;
      } else if (this.currentTable == 'active') {
        if (order.status == 'standing') {
          return true;
        }
        if (order.status == 'pulling') {
          return true;
        }
      }

      return false;
    },
  },

  created: function () {
    this.getCards();
    this.getOrders();
  },
});
