const request = require("request");
const cheerio = require("cheerio");
const AllMatchObj = require("./AllMatch");

const fs = require("fs");
const path = require("path");

const iplPath = path.join(__dirname, "IPL");
dirCreator(iplPath);

const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(url, cb);
function cb(err, response, html)
{
    if(err)
    {
        console.log("Error");
    }
    else {
        getAllResults(html);
    }
}
function getAllResults(html)
{
    let $ = cheerio.load(html);
    let allResults = $("a[data-hover='View All Results']");
    let href = $(allResults).attr("href");
    let fullLink = "https://www.espncricinfo.com/" + href;
    AllMatchObj.getAllMatch(fullLink);
}

function dirCreator(filePath)
{
    if(fs.existsSync(filePath) == false)
    {
        fs.mkdirSync(filePath);
    }
}
