const BASE_URL = process.env.BASE_URL || "/api/v1/";
const mongoDB = process.env.MONGO_URL || "mongodb://iot-central:iot-central123@ds217678.mlab.com:17678/iot-central";

module.exports = { BASE_URL, mongoDB };
