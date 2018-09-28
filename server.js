mongoose = require("mongoose");
async = require("async");
log4js = require("log4js");
const express = require("express");
const bodyParser = require("body-parser");
const constant = require("./server/utils/constants");
require("./server/config/db");
const app = express();

log4js.configure({
    appenders: {
        'file': { type: 'file', filename: 'log/server.log' },
        'console': { type: 'console' }
    },
    categories: { 'default': { appenders: ['file', 'console'], level: 'info' } }
});
const logger = log4js.getLogger('server.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Battle = require('./server/routes/battle');
var BattleServiceImpl = require('./server/serviceImpl/battleServiceImpl');

app.get('/api/battle/token', Battle.generateJWTToken);
app.post('/api/csv/upload', BattleServiceImpl.checkToken, Battle.uploadBattleFile);
app.get('/api/battle/list', BattleServiceImpl.checkToken, Battle.getBattlesPlace);
app.get('/api/battle/count', BattleServiceImpl.checkToken, Battle.getBattlesCount);
app.get('/api/battle/search', BattleServiceImpl.checkToken, Battle.getSearchedBattle);
app.get('/api/battle/stats', BattleServiceImpl.checkToken, Battle.getBattleStats);

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.listen(constant.PORT, function () {
    logger.info("Server is running at port: " + constant.PORT);
    // logger.warn("Server is running at port: " + consts.PORT);
    // logger.error("Server is running at port: " + consts.PORT);
    // logger.fatal("Server is running at port: " + consts.PORT);
});