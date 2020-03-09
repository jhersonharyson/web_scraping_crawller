const router = require("express").Router();
import { readdirSync } from "fs";
import { resolve } from "path";
import { BASE_URL } from "../config/constants";

export default app => {
  readdirSync(__dirname)
    .filter(file => file.indexOf(".") !== 0 && file !== "index.js")
    .forEach(
      file =>
        file.endsWith(".js") &&
        app.use(
          BASE_URL,
          router.use("/", require(resolve(__dirname, file)).default)
        )
    );
};
