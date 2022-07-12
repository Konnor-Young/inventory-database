const dotenv = require(`dotenv`);
const flags = require(`flags`);
flags.defineNumber(`port`, 3000);
flags.parse();

const port = flags.get(`port`) || process.env.PORT || 3000;

module.exports = {
    dotenv: dotenv,
    http_port: port
};