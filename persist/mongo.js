const mongoose = require(`mongoose`);
const db = mongoose.connection;

async function connect(user, pass, host, port, db_name) {
    let connectionString = `mongodb+srv://${user}:${pass}@cluster0.ohorb.mongodb.net/?retryWrites=true&w=majority`
    try{
        await mongoose.connect(
            connectionString, {
                useNewURlParser: true,
                useUnifiedTopology: true
            });
    } catch (err) {
        console.log(`error connecting to mongo`, err);
        throw `mongo couldn't connect`;
    }
};
function onConnect (callback) {
    db.once(`open`, ()=>{
        console.log(`mongodb connection open`);
        callback();
    })
};

module.exports = {
    connect: connect,
    onConnect: onConnect
}