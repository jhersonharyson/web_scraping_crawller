const puppeteer = require('puppeteer')

const compiler = async (url) => {
    console.log('send to api');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3333/index.html');
    page.waitFor(15000)
    await browser.close();
} 

exports.compiler = compiler