const cliProgress = require('cli-progress');
 
// create new container
const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true
 
}, cliProgress.Presets.shades_grey);
 
// add bars
const b1 = multibar.create(200, 0);
const b2 = multibar.create(1000, 0);
 
// control bars
b1.increment();
b2.update(400, {filename: "helloworld.txt"});
setInterval(()=> b1.increment(), 500)
 
// // stop all bars
// multibar.stop();