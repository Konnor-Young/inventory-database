const session = require(`express-session`);

const setUpSessionStore = function(app) {
    app.use(
        session({
            secret: `boltTHEbird`,
            resave: false,
            saveUninitialized: false,
        })
    );
};

module.exports = setUpSessionStore;