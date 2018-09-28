var XLSX = require('xlsx');
require('../models/battle');
var Battle = mongoose.model('battleCollection');
const constant = require("../utils/constants");

var logger = log4js.getLogger('battleSeviceImpl.js');
let limit = 1000;

module.exports = {
    addBattleDataToDB: function (res) {
        var battleWorkbook = XLSX.readFile('./' + constant.BATTLE_CSV_FILE_URL);
        var battle_name_list = battleWorkbook.SheetNames;
        var battles = XLSX.utils.sheet_to_json(battleWorkbook.Sheets[battle_name_list[0]]);

        console.log(battles.length);
        async.series([
            function (callback) {
                while (battles.length) {
                    let limitRecord = battles.splice(0, limit);
                    logger.debug('battle record length: ' + battles.length);
                    logger.debug('Battles Slice record length: ' + limitRecord.length);
                    async.series([
                        function (callback) {
                            conn.collection(constant.BATTLE_HISTORY_COLLECTON).insertMany(limitRecord)
                                .then(function (mongooseDocuments) {
                                    callback();
                                })
                                .catch(function (err) {
                                    logger.debug('Error while insertMany of addBattleDataToDB: ' + err);
                                });
                        }
                    ],
                        function (err, results) {
                            if (err) {
                                logger.debug('Error while nested series of addBattleDataToDB: ' + err);
                            }
                        });
                }
                callback();
            }
        ],
            function (err, results) {
                if (err) {
                    logger.debug('Error while calling first series ' + err);
                }
                logger.debug('addBattleDataToDB: Record inserted succesfully of battle_history');
                res.send({ status: true, message: constant.SUCCESS, developerInfo: 'Record inserted succesfully' });                
            });


    }    
}