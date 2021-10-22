const request = require("request");
const cheerio = require("cheerio");
const scoreObj = require("./scorecard");

function getAllMatchesLink(url)
{
    request(url, cb)
    function cb(err, response, html)
    {
        if(err)
    {
        console.log("Error");
    }
    else {
        extractMAtchesLink(html);
    }
    }
}

function extractMAtchesLink(html)
{
    let $ = cheerio.load(html);
    let scoreElem = $("a[data-hover='Scorecard']");
    for(let i = 0; i < scoreElem.length; i++)
    {
        let link = $(scoreElem[i]).attr('href');
        let fullLink = "https://www.espncricinfo.com/" + link;
        console.log(fullLink);
        scoreObj.ps(fullLink);
    }
}

module.exports = {
    getAllMatch : getAllMatchesLink
}