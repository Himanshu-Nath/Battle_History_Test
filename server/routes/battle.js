require('../models/battle');
const async = require('async');
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
        });
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
    },

    getSearchedBattle: function(req, res) {
        logger.info(req.query);
        let searchQuery = {};
        if(req.query.type) {
            searchQuery.battle_type = req.query.type;
        }
        if(req.query.location) {
            searchQuery.location = req.query.location;
        }
        if(req.query.king) {
            let king = new RegExp(req.query.king, 'i');
            searchQuery.$or = [ 
                {attacker_king: king }, 
                {defender_king: king } 
            ];
        }
        Battle.find(searchQuery, function(err, result) {
            if(err) {
                logger.error('getSearchedBattle: error while searching battle: ' + err);
                res.send({ status: false, message: constant.FAIL, devMsg: "error while finding battle count", err });
            } else {
                if(result != null) {
                    logger.info('getSearchedBattle: successfully got the battle result');
                    res.send({ status: true, message: constant.SUCCESS, result });         
                } else {
                    logger.error('getSearchedBattle: failed to get the battle result');
                    res.send({ status: false, message: constant.FAIL, devMsg: "failed to get the battle result" });
                }                
            }
        });
    },

    getBattleStats: function(req, res) {
        // Battle.aggregate([
        //     {
        //         $group: {
        //             _id: {},
        //             win_outcome: { 
        //                 $sum: {
        //                     $cond: [{ $eq: ["$attacker_outcome", "win"] }, 1, 0]
        //                 } 
        //             },
        //             loss_outcome: { 
        //                 $sum: {
        //                     $cond: [{ $eq: ["$attacker_outcome", "loss"] }, 1, 0]
        //                 } 
        //             },
        //             battle_type: { $addToSet:"$battle_type" },
        //             average_defender: { $avg: "$defender_size" },
        //             min_defender: {  $min: "$defender_size" },
        //             max_defender: {  $max: "$defender_size" }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             attacker_outcome: {
        //                 win: "$win_outcome",
        //                 loss: "$loss_outcome"
        //             },
        //             battle_type: "$battle_type",
        //             defender_size: {
        //                 average : "$average_defender",
        //                 min : "$min_defender",
        //                 max : "$max_defender",
        //             }
        //         }
        //     }
        // ], function (err, result) {
        //     if (err) {
        //         logger.error('getBattleStats: error while finding battle stats due to: ' + err);
        //         res.status(500).send({ status: false, message: constant.FAIL, devMsg: "failed to get the battle stats", err });
        //     } else {
        //         logger.info('getBattleStats: successfully got the battle stats');
        //         res.send({ status: true, message: constant.success, result });
        //     }
        // });


        async.series([
            function(callback) {
                Battle.aggregate([
                    { $group : { "_id": "$attacker_king", "count": { "$sum": 1 } } },
                    { $sort : {"count" : -1} },
                    { $project : {"attacker_king" : "$_id", "_id" : 0} } ,
                    { $limit : 1 }
                ], function (err, result) {
                    if (err) {
                        logger.error('getBattleStats: error for attacker_king: ' + err);
                    } else {
                        callback(null, result);
                    }
                });
            },
            function(callback) {
                Battle.aggregate([
                    { $group : { "_id": "$defender_king", "count": { "$sum": 1 } } },
                    { $sort : {"count" : -1} },
                    { $project : {"defender_king" : "$_id", "_id" : 0} } ,
                    { $limit : 1 }
                ], function (err, result) {
                    if (err) {
                        logger.error('getBattleStats: error for defender_king: ' + err);
                    } else {
                        callback(null, result);
                    }
                });
            },
            function(callback) {
                Battle.aggregate([
                    { $group : { "_id": "$region", "count": { "$sum": 1 } } },
                    { $sort : {"count" : -1} },
                    { $project : {"region" : "$_id", "_id" : 0} } ,
                    { $limit : 1 }
                ], function (err, result) {
                    if (err) {
                        logger.error('getBattleStats: error for region: ' + err);
                    } else {
                        callback(null, result);
                    }
                });
            },
            function(callback) {
                Battle.aggregate([
                    { $group : { _id: "$name", name: { $sum: { $add : [ '$attacker_size', '$defender_size' ] }}, } },
                    { $sort : {"name" : -1} },
                    { $limit : 1 }
                ], function (err, result) {
                    if (err) {
                        logger.error('getBattleStats: error for region: ' + err);
                    } else {
                        callback(null, result);
                    }
                });
            }
        ],
        function(err, results) {
            console.log(results);
            Battle.aggregate([
                {
                    $group: {
                        _id: {},
                        win_outcome: { 
                            $sum: {
                                $cond: [{ $eq: ["$attacker_outcome", "win"] }, 1, 0]
                            } 
                        },
                        loss_outcome: { 
                            $sum: {
                                $cond: [{ $eq: ["$attacker_outcome", "loss"] }, 1, 0]
                            } 
                        },
                        battle_type: { $addToSet:"$battle_type" },
                        average_defender: { $avg: "$defender_size" },
                        min_defender: {  $min: "$defender_size" },
                        max_defender: {  $max: "$defender_size" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        attacker_outcome: {
                            win: "$win_outcome",
                            loss: "$loss_outcome"
                        },
                        battle_type: "$battle_type",
                        defender_size: {
                            average : "$average_defender",
                            min : "$min_defender",
                            max : "$max_defender",
                        }
                    }
                }
            ], function (err, result) {
                if (err) {
                    logger.error('getBattleStats: error while finding battle stats due to: ' + err);
                    res.status(500).send({ status: false, message: constant.FAIL, devMsg: "failed to get the battle stats", err });
                } else {
                    result[0].most_active = {
                        attacker_king: results[0][0].attacker_king,
                        defender_king: results[1][0].defender_king,
                        region: results[2][0].region,
                        name: results[3][0]._id,
                    }
                    logger.info('getBattleStats: successfully got the battle stats');
                    res.send({ status: true, message: constant.success, result });
                }
            });
        });
    }

}