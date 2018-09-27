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
app.post('/api/csv/upload', Battle.uploadBattleFile);

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.listen(constant.PORT, function () {
    logger.info("Server is running at port: " + constant.PORT);
    // logger.warn("Server is running at port: " + consts.PORT);
    // logger.error("Server is running at port: " + consts.PORT);
    // logger.fatal("Server is running at port: " + consts.PORT);
});