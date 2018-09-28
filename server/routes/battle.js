require('../models/battle');
var Battle = mongoose.model('battleCollection');
var logger = log4js.getLogger('battle.js');
var battleServiceImple = require("../serviceImpl/battleServiceImpl");
const constant = require("../utils/constants");

module.exports = {
    uploadBattleFile: function(req, res) {
        Battle.count({}, function(err, count) {
            if(err) {
                res.send({ status: false, message: "error occurred while getting count", err });
            } else {
                console.log(count)
                if(count != undefined && count > 0) {
                    logger.info("uploadBattleFile: record present in battles_history collection");
                    res.send({ status: true, message: constant.SUCCESS, count: count, devMsg: "Record already present" });
                } else {
                    logger.info("uploadBattleFile: data is fetching from excel sheet and will store into battles_history collection");
                    battleServiceImple.addBattleDataToDB(res)
                }
            }
        })
    }
}