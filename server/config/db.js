const constant = require('../utils/constants');
const logger = log4js.getLogger('db.js');

mongoose.Promise = global.Promise;
mongoose.connect(constant.MONGODB_MLAB_URL);
conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function() {
    logger.info("Connected");
});

process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    logger.info("Mongoose default connection disconnected through app termination");
    process.exit(0); 
  });
});