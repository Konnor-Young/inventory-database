const passport = require(`passport`);
const localStrategy = require(`passport-local`);
const { User } = require(`../persist/model`);

passport.use(
    new localStrategy (async (username, password, done)=>{
        let user;
        try {
            user = await User.findOne({username: username, password: password});
            if(!user){
                return done(null, false);
            } 
            return done(null, user);
        } catch (err) {
            done(err)};
    })
);
const setUpAuth = function (app) {
    app.use(passport.initialize());
    app.use(passport.authenticate(`session`));

    passport.serializeUser(function(user, cb){
        cb(null, { id: user._id, username: user.username });
    });
    passport.deserializeUser(function(user, cb){
        return cb(null, user);
    });

    app.post(`/sessions`, passport.authenticate(`local`), (req, res)=>{
        res.status(201).json({message: `created session`});
    });
    app.get(`/sessions`, (req, res)=>{
        if(!req.user){
            res.status(401).json({message: `not authenticated`});
            return;
        }
        res.status(200).json({message: `authenticated`});
    });
};

module.exports = setUpAuth;