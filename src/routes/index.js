const router = require("express").Router();
const { readdirSync } = require("fs");
const { resolve } = require("path");
const { BASE_URL } = require("./../config/constants");

module.exports = app => {
  
  readdirSync(__dirname)
    .filter(file => file.indexOf(".") !== 0 && file !== "index.js")
    .forEach(
      file =>
        file.endsWith(".js") &&
        app.use(
          BASE_URL,
          router.use("/", require(resolve(__dirname, file)))
        )
    );
};
