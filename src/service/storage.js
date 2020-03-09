const fs = require('fs');


const unlinkRawFile = () =>{
    try{
        fs.unlinkSync('./../../tmp/raw.html')
    }catch(e){
        if(e.code !== 'ENOENT')
            console.log(e)
    }
}

const unlinkScrapedFile = () =>{
    try{
        fs.unlinkSync('./../../public/index.html')
    }catch(e){
        if(e.code !== 'ENOENT')
            console.log(e)
    }
}

const clearFiles = () =>{
    try{
        unlinkRawFile();
        unlinkScrapedFile();
    }catch(e){
        console.log(e)
    }
}


exports.clearFiles = clearFiles