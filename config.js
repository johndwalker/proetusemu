exports.MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/?poolSize=20&writeConcern=majorityw';
exports.MONGO_DB = process.env.MONGO_DB || 'sfwb';
exports.HTTP_PORT = process.env.HTTP_PORT || '3000';
exports.NODE_ENV = process.env.NODE_ENV || 'dev';
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'info';