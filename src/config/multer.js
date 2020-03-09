const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const multer_upload = {
  dest: path.resolve(__dirname, "..", "..", "tmp", /*"uploads"*/),
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.resolve(__dirname, "..", "..", "tmp", /*"uploads"*/));
    },
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) callback(err);

        const filename = `raw.html`//`${hash.toString("hex")}-${file.originalname}`;
        //console.log(filename);
        callback(null, filename);
      });
    }
  }),
  limits: {
    fileSize: Infinity
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = [
      "text/html",
    ];
    
    if (allowedMimes.includes(file.mimetype)) callback(null, true);
    else callback(new Error("Invalid file type."));
  },
  onError: function(err, next) {
    console.log("error", err);
    next(err);
  }
};

module.exports = multer_upload;
