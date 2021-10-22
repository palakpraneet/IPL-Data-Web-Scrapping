const request = require("request");
const cheerio = require("cheerio");

const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");


function processScorecard(url)
{
    request(url, cb);   
}

function cb(err, response, html)
{
    if(err)
    {
        console.log("Error");
    }
    else {
        extractAllDetails(html);
    }
}

function extractAllDetails(html)
{
    let $ = cheerio.load(html);

    // for venue date result
    let details = $(".header-info .description");
    let common = $(details[0]).text();
    common = common.split(',');
    let venue = common[1].trim();
    let date = common[2].trim();

    // for result
    let resultElem = $(".event .status-text span");
    let result = $(resultElem).text();
    
    // for team name and opponent name 
    let innings = $(".card.content-block.match-scorecard-table>.Collapsible");
    for(let i = 0; i < innings.length; i++)
    {
        let teamName = $(innings[i]).find("h5").text();
        teamName = teamName.split("INNINGS")[0].trim();
        let oppIndex = i == 0 ? 1 : 0;
        let opponent = $(innings[oppIndex]).find("h5").text();
        opponent = opponent.split("INNINGS")[0].trim();
        let cInning = $(innings[i]);
        console.log(`Team Name: ${teamName}`);

        let allBatsmen = cInning.find(".table.batsman tbody tr");
        // for individual details
        for(let j = 0; j < allBatsmen.length; j++)
        {
            let allCols = $(allBatsmen[j]).find("td");
            let hasclass = $(allCols[0]).hasClass("batsman-cell");
            if(hasclass == true)
            {
                let name = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim();
                console.log(`Name : ${name} | Runs: ${runs} | Balls : ${balls} | Fours : ${fours} | Sixes : ${sixes} | Strike Rate : ${sr}`);
                processPlayer(teamName, name, runs, balls, fours, sixes, sr, opponent, date, venue, result);
            } 
        }
    }
}

// To write data into excel file
function processPlayer(teamName, name, runs, balls, fours, sixes, sr, opponent, date, venue,result)
{
    let teamPath = path.join(__dirname, "IPL", teamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath, name + ".xlsx");
    let content = excelReader(filePath, name);
    let playerObj = {
        "Team Name":teamName,
        "Palyer Name":name,
        "Runs" : runs,
        "Balls" : balls,
        "Fours" : fours,
        "Sixes" : sixes,
        "Strike Rate" : sr,
        "Opponent" : opponent,
        "Date" : date,
        "Venue" : venue,
        "Result" : result
    }
    content.push(playerObj);
    excelWriter(filePath, name, content);
}


module.exports = {
    ps : processScorecard
}

function dirCreator(filePath)
{
    if(fs.existsSync(filePath) == false)
    {
        fs.mkdirSync(filePath);
    }
}


// Excel REader and Writer

function excelWriter(filePath, sheetName, json)
{
    let newWb = xlsx.utils.book_new();
    let newWs = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWb, newWs, sheetName);
    xlsx.writeFile(newWb, filePath);
}


function excelReader(filePath, sheetName)
{
    if(fs.existsSync(filePath) == false){
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}