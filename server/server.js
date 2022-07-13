const express = require(`express`);
const app = express();
const cors = require(`cors`);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

module.exports = {
    server: app
}