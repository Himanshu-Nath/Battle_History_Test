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
    },
    
    getBattlesPlace: function(req, res) {
        Battle.aggregate([
            { $match: {name: { $ne: null }} },
            {
                $project:
                { 
                    _id: 0,
                    places: {
                        $concat: [ {$ifNull: [ "$location", "N/A" ]}, " , ", "$region" ]
                    }                    
                } 
            },
            {
                $group: 
                {
                    _id:null,
                    places:
                    { $addToSet:'$places' }
                }
            },
            // optional only for sorting
            {"$unwind": "$places"},
            {"$group": {"_id": null, "places": {"$addToSet": "$places" }}},
            {"$unwind": "$places"},
            {"$sort": { "places": 1} },
            {"$group": { "_id": null, "places": {"$push": "$places" }}}
        ], function (err, result) {
            if (err) {
                logger.error('getBattlesPlace: error while finding battle places due to: ' + err);
                res.status(500).send({ status: false, message: constant.FAIL, devMsg: "failed to get the battle places", err });
            } else {
                logger.info('getBattlesPlace: successfully got the battle places');
                res.send({ status: true, message: constant.success, result });
            }
        })
    },

    getBattlesCount: function(req, res) {
        Battle.countDocuments({name: { $ne: null } }, function(err, count) {
            if(err) {
                logger.error('getBattlesCount: error while finding battle count: ' + err);
                res.send({ status: false, message: constant.FAIL, devMsg: "error while finding battle count", err });
            } else {
                if(count > 0) {
                    logger.info('getBattlesCount: successfully got the battle count');
                    res.send({ status: true, message: constant.SUCCESS, battleOccurred: count });         
                } else {
                    logger.error('getBattlesCount: failed to get the battle count');
                    res.send({ status: false, message: constant.FAIL, devMsg: "failed to get the battle count" });
                }                
            }
        });
    }

}