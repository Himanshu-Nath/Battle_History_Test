module.exports = {    
    PORT : process.env.PORT || 3000,  

    POST : "POST",
    GET : "GET",
    PUT : "PUT",
    DELETE : "DELETE",

    SUCCESS : "SUCCESS",
    FAIL : "FAILED",
    ERROR : "ERROR",
    ADD : "ADDED",
    DELETE : "DELETED",

    MONGODB_LOCALHOST_URL: "mongodb://localhost/battle",
    MONGODB_MLAB_URL: "mongodb://test:test123@ds117773.mlab.com:17773/instarem",

    BATTLE_CSV_FILE_URL : "data/battles.csv",

    BATTLE_HISTORY_COLLECTON: "battles_history"
};