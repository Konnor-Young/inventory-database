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
    addCardSubPage: 'Search',
    addOrderSubPage: 'searchCard',
    viewOrderSubPage: 'inStore',
    inStore: false,
    updatingOrder: -1,
    updatingCard: -1,
    currentOrder: {},
    currentCard: {},
    cardInfo: null,
    indCard: {},
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
    pages: ['Inventory', 'Add Card', 'View Orders'],
    pileList: [],
    searchResults: [],
    searchResultsStats: {},
    searchResultsPaginated: [],
    loggedIn: false,
    tableFilters: ['active', 'standing', 'pulling', 'shipped'],
    currentTable: 'active',
    fab: false,
    addPileLoading: false,
    username: '',
    password: '',
    logMessage: '',
    storeLogins: { GH0298: '123', GH0299: '123', GH0300: '123', test: '123' },
    invalidLogin: false,
    incorrectLoginAttempts: 0,
    addSearchCurrentPage: 1,
    dialog: false,
    badSearchAlert: false,
    pileLocations: false,
    isGettingLocations: false,
    cardsInInventory: [],
    searchString: '',
    conditions: ['NM', 'LP', 'MP', 'HP', 'DMG'],
  },
  methods: {
    newCard: async function (cardObject) {
      this.addPileLoading = true;
      let arrayLength = cardObject.length;
      console.log(cardObject[0], `here`);
      for (let i = 0; i < arrayLength; i++) {
        let card = cardObject.shift();
        let id;
        console.log(cardObject, `here`);
        if (card.tcgplayer_id) {
          id = card.tcgplayer_id;
        } else {
          id = card.tcgplayer_etched_id;
        }
        let newCard = {
          tcg_id: id,
          name: card.name,
          set: card.set_name,
          image_uris: card.image_uris,
          prices: card.prices,
          location: card.location,
          condition: card.condition,
          foil: card.finish,
        };
        await this.postCards(newCard);
        this.pileList;
      }
      this.addPileLoading = false;
      this.pileList = [];
      this.addPileLoading = false;
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
    addToPile: function (index) {
      let item = this.searchResultsPaginated[index];
      // item.foil = foil;
      var conditions = ['NM', 'LP', 'MP', 'HP', 'DMG'];
      // var cards = this.createCardForPile(item, "DMG", item.totalConditions.DMG);
      // console.log(cards);
      // this.pileList.push(cards)

      for (let i in conditions) {
        let condition = conditions[i];
        // console.log(condition);
        // console.log(i);
        if (item.totalConditions[condition] > 0) {
          var card = this.createCardForPile({ ...item }, condition);
          // console.log(card);
          var qty = item.totalConditions[condition];
          for (let j = 0; j < qty; j++) {
            this.pileList.push({...card});
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
      item.totalCards = 0;
      item.editing = false;

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
      data.totalConditions = {
        NM: 0,
        LP: 0,
        MP: 0,
        HP: 0,
        DMG: 0,
      };
      data.finish = this.vFinishes(data.finishes[0], null)[0];
      data.totalCards = 0;
      this.searchResultsPaginated.push(data);
    },
    getSearch: async function () {
      this.badSearchAlert = false;
      let response = await fetch(
        `${SEARCH_URL}${this.searchName}${SEARCH_PARAM}`
      );
      if (response.status == 404) {
        this.badSearchAlert = true;
        // console.log('bad Search');
        return;
      }
      let data = await response.json();
      //   console.log(data.object);
      let listOfCards = data.data;
      this.searchResultsStats = {
        total_cards: data.total_cards,
        has_more: data.has_more,
        next_page: data.next_page,
      };

      //   console.log(this.searchResultsStats)

      data.data.forEach((item) => {
        item.totalConditions = {
          NM: 0,
          LP: 0,
          MP: 0,
          HP: 0,
          DMG: 0,
        };
        item.totalCards = 0;
        item.finish = this.vFinishes(item.finishes[0], null)[0];
      });
      let cardSearchList = data.data;
      let newCardSearchList = [];
      cardSearchList.forEach((entry)=>{
        if (entry.hasOwnProperty(`tcgplayer_id`) || entry.hasOwnProperty(`tcgplayer_etched_id`)){
          newCardSearchList.push(entry);
        }
      })
      console.log(this.searchResults);
      this.searchResults = cardSearchList.slice();
      listOfCards.splice(25);
      console.log(data.data);
      this.searchResultsPaginated = newCardSearchList;
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
    // ?? Need to add non negative validation
    removeLPtoObject: function (cardObject) {
      if (cardObject.totalConditions.LP - 2 >= 0) {
        cardObject.totalConditions.LP -= 2;
        cardObject.totalCards -= 2;
      } else {
        cardObject.totalConditions.LP = 0;
      }
    },
    removeNMtoObject: function (cardObject) {
      if (cardObject.totalConditions.NM - 2 >= 0) {
        cardObject.totalConditions.NM -= 2;
        cardObject.totalCards -= 2;
      } else {
        cardObject.totalConditions.LP = 0;
      }
    },
    removeMPtoObject: function (cardObject) {
      if (cardObject.totalConditions.MP - 2 >= 0) {
        cardObject.totalConditions.MP -= 2;
        cardObject.totalCards -= 2;
      } else {
        cardObject.totalConditions.LP = 0;
      }
    },
    removeHPtoObject: function (cardObject) {
      if (cardObject.totalConditions.HP - 2 >= 0) {
        cardObject.totalConditions.HP -= 2;
        cardObject.totalCards -= 2;
      } else {
        cardObject.totalConditions.HP = 0;
      }
    },
    removeDMGtoObject: function (cardObject) {
      if (cardObject.totalConditions.DMG - 2 >= 0) {
        cardObject.totalConditions.DMG -= 2;
        cardObject.totalCards -= 2;
      } else {
        cardObject.totalConditions.DMG = 0;
      }
    },
    getSession: async function () {
      let response = await fetch(`${URL}/sessions`, {
          method: 'GET',
          credentials: 'include'
      });
      if (response.status == 200){
          this.loggedIn = true;
          this.getCards();
      }
      let data = await response;
      console.log(response.status);
  },
  postSession: async function (userinfo) {
    let response = await fetch(`${URL}/sessions`, {
        method: 'POST',
        body: JSON.stringify(userinfo),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
    // let body = await response.json();
    console.log(response.status);
    // console.log(body);
    if (response.status == 201){
        this.username = '';
        this.password = '';
        this.logMessage = '';
        this.getSession();
    }else{
        this.password = '';
        this.logMessage = `invalid: username or password incorrect`;
        this.invalidLogin = true;
        this.incorrectLoginAttempts += 1;
    }
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
      let response = await fetch(`${URL}/skus`, {
        method: 'GET',
        credentials: 'include',
      });
      let data = await response.json();
      this.cardList = data;
      console.log(response.status);
      console.log(data);
      this.updatingCard = -1;
    },
    getAllCards: async function () {
      let response = await fetch(`${URL}/cards`, {
        method: 'GET',
        credentials: 'include',
      });
      let data = await response.json();
      this.cardsInInventory = data;
      console.log(response.status);
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
    // Really post SKU
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
      if (response.status == 200) {
        this.getCards();
      } else {
        console.log('Error posting Cards:', response.status);
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
      this.searchResultsPaginated = [];
      this.searchResultsStats = {};
    },
    focusOntoSearch: function () {
      // console.log(this.$refs.searchInput);
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

    // ==== Testing floating button on bottom
    onScroll(e) {
      if (typeof window === 'undefined') return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.fab = top > 20;
    },
    toTop() {
      this.$vuetify.goTo(0);
    },

    // ===== Function to go through list of cards and return single cards
    cardsToCard: function (listOfCards) {
      listOfCards.forEach((card) => {
        // console.log(card)
        return card;
      });
    },
    getLocation: async function () {
      this.isGettingLocations = true;
      var numberOfCards = { number: this.pileList.length };
      let response = await fetch(`${URL}/locations`, {
        method: 'POST',
        body: JSON.stringify(numberOfCards),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      let data = await response.json();
      // console.log(response.status);
      let i = 0;
      this.pileList.forEach((card) => {
        card.location = data[i];
        // console.log(card.location);
        i++;
        // console.log(card);
      });
      this.allPileHasLocations();
      this.isGettingLocations = false;
    },
    totalActiveOrders: function () {
      return this.orderList.length;
    },
    vFinishes: function (cardFinishes, cardObject) {
      let tempList = [];
      if (cardFinishes.includes('nonfoil')) {
        tempList.push('Non-Foil');
      }
      if (cardFinishes.includes('foil')) {
        tempList.push('Foil');
      }
      if (cardFinishes.includes('etched')) {
        tempList.push('Etched');
      }
      if (cardFinishes.includes('glossy')) {
        tempList.push('Glossy');
      }
      return tempList;
    },
    updateCardFinish: function (index, finish) {
      this.searchResultsPaginated[index].finish = finish;
      // console.log("Updated Card Finish")
      // console.log(cardObject.finish)
      // this.getCardPrice(cardObject);
      // return cardObject;
    },
    getCardPrice: function (cardObject) {
      let price = "";
      // console.log(cardObject.finish)
      if (cardObject.finish == 'Non-Foil') {
        price = cardObject.prices.usd;
      } else if (cardObject.finish == 'Foil') {
        price = cardObject.prices.usd_foil;
      } else if (cardObject.finish == 'Etched') {
        price = cardObject.prices.usd_etched;
      } else {
        price = 'UKN';
      }
      if (price == null) {
        price = 'NONE';
      }
      // console.log(price)
      return '$' + price;
    },
    getTotalCards: function (cardObjectArray) {
      let totalCards = 0;
      for (let i = 0; i < cardObjectArray.length; i++) {
        totalCards += cardObjectArray[i].cards.length;
      }
      return totalCards;
    },
    login: function (username, password) {
      let userinfo = {
        'username': username,
        'password': password
      }
      this.postSession(userinfo);
    },
    changeDisplayedCards: function () {
      let offset = this.addSearchCurrentPage - 1;
      let start = offset * 25;
      let stop = start + 25;

      this.searchResultsPaginated = this.searchResults.slice(start, stop);
    },
    changePage: function (page) {
      this.addSearchCurrentPage = page;
      this.changeDisplayedCards();
      return this.searchResultsPaginated;
    },
    //  FINISHED but only adding first price available usd then usd_foil then $0.01
    checkInventoryValue: function (inventoryArray) {
      let normalTotal = 0.0;
      for (let i = 0; i < inventoryArray.length; i++) {
        let object = inventoryArray[i];
        console.log(object);
        let price = 0.0;
        for([key, value] of Object.entries(object.locations)){
          if(key.includes('foil')){
            if(object.price.usd_foil != null && object.price.usd_foil != 'null'){
              price += (value.quantity * parseFloat(object.price.usd_foil))
            }else if(object.price.usd_etched != null && object.price.usd_etched != 'null'){
              price += (value.quantity * parseFloat(object.price.usd_etched))
            }
          }else{
            if(object.price.usd != null && object.price.usd != 'null'){
              price += (value.quantity * parseFloat(object.price.usd))
            }
          }
        }
        console.log(price);
        normalTotal += price;
        // let card = inventoryArray[i];

      //   if (card.quantity.physical > 0) {
      //     if (card.price.usd == null || card.price.usd == 'null') {
      //       // try foil price
      //       if (card.price.usd_foil == null || card.price.usd_foil == 'null') {
      //         normalTotal += 0.01 * card.quantity.physical;
      //       } else {
      //         // console.log(card.price.usd_foil);
      //         normalTotal +=
      //           parseFloat(card.price.usd_foil) * card.quantity.physical;
      //       }
      //     } else {
      //       // console.log(card.price.usd);
      //       normalTotal += parseFloat(card.price.usd) * card.quantity.physical;
      //     }
      //   }
      }
      console.log(normalTotal);
      return Number(normalTotal.toFixed(2));
    },
    allPileHasLocations: function () {
      this.pileLocations = true;
      for (i in this.pileList) {
        let card = this.pileList[i];
        // console.log(card);
        if (card.location > 0) {
          // console.log('good');
        } else {
          // console.log('not shown');
          this.pileLocations = false;
        }
      }
    },
    indCardInfo: async function (card_id) {
      let response = await fetch(`${URL}/cards/${card_id}`, {
        method: 'GET',
        credentials: 'include',
      });
      let data = await response.json();
      this.indCard = data;
      console.log(response.status);
      console.log(data);
    },
    getCardLocation: function (index) {      
      let card = this.pileList[index];
      if (card.location > 0) {
        return card.location
      } else {
        return ""
      }
    },
    deleteCardFromPile: function (index) {
      this.pileList.splice(index, 1);
    },
    duplicateCardFromPile: function (index) {
      let card = this.pileList[index];
      let dupCard = {...card};
      dupCard.location = "";
      this.pileList.push(dupCard);
      this.allPileHasLocations();
    },
    editCardFromArray: function (array, index, condition, type, location) {
      let card = array[index];

    },
    enterEditingMode: function (array, index) {
      let card = array[index];
      card.editing = true;
      this.$forceUpdate();
    },
    saveCardFromEditingMode: function (array, index) {
      let card = array[index];
      card.editing = false;
      this.$forceUpdate();
    },
    searchInventory: async function(){
      searchInventoryList = [];
      let filters = this.inventorySearchFilter;
      this.cardList.forEach(entry=>{
        let add = true;
        let thisCard = Object.values(entry);
        for(i=0;i<filters.length;i++){
          if(!thisCard.includes(filters[i])){
            add = false;
            break;
          }
        }
        if(add){
          searchInventoryList.push(entry);
        }
      })
      this.searchString = '';
    },
  },

  created: function () {
    this.getSession();
    this.getCards();
    this.getAllCards();
    this.getOrders();
  },
  computed: {
    lengthOfAddCardSearch: function () {
      if (!Object.keys(this.searchResultsStats).includes('total_cards')) {
        return 1;
      } else if (this.searchResultsStats.total_cards > 0) {
        return Math.ceil(this.searchResultsStats.total_cards / 25);
      } else {
        return 1;
      }
    },
    inventorySearchFilter: function () {
      let filterList = this.searchString.split(',');
      return filterList;
    }
  },
});
