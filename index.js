const app = require(`./server/server`);
const { connect, onConnect } = require(`./persist/mongo`);
const config = require(`./server/config`);

config.dotenv.config();

onConnect(()=>{
    app.server.listen(config.http_port, () => {
        console.log(`listening on port ${config.http_port}`);
    });
});

try{
    connect(
        process.env.USERNAME,
        process.env.PASSWORD
    );
} catch (err) {
    console.log(`could not connect`, err);
}