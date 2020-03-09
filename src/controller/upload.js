const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("../config/multer");
const { clearFiles } = require('./../service/storage')
const { writeFile } = require('./../service/crawler')
const { compiler } = require('./../service/compiler')

const fs = require('fs')

const fileUpload = multer(multerConfig).single("file");

exports.post = async (req, res, next) => {
 
  try{
    clearFiles();
    console.log('clear files')

    
      fileUpload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          return res.status(400).json({ upload: "validation MulterError" });
        } else if (err) {
          // An unknown error occurred when uploading.
          return res.status(400).json({ upload: "unknown error" });
        }
        // console.log(req.file);
        console.log('success on upload file')
        
        try{
    
          writeFile();
          console.log('write new scraped file')
    
          await compiler();
          console.log('compile new file')

        }catch(e){
          throw new Error(e)
        }
        
        return res.status(200).json({ upload: "success" });
      })
  }catch(e){
    return res.status(304).json({ error: e.message });
  }
};
