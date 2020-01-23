const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

let dataPath = path.join(__dirname, 'data');

crawl(dataPath);

function isFolder(path){
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

function crawl(pathValue){
    if(isFolder(pathValue)){
        fs.readdir(pathValue, (err, files) => {
            if(err){
                console.log(err);
            }else{
                files.forEach(file => {
                    crawl(path.join(pathValue, file));
                });
            }
        });
    }else{
        let fileName = path.basename(pathValue);
        let folderPath = path.dirname(pathValue);
        let folderName = path.basename(folderPath);

        let fileExtension = fileName.substr(fileName.indexOf('.'), fileName.length);

        if(fileExtension == '.csv'){
            readcsv(fileName, pathValue);
        }

    }
}

function readcsv(type, pathValue){
    if(pathValue.includes(type)){
        fs.createReadStream(pathValue)
            .pipe(csv.parse({ header: true }))
            .on('error', error => console.log(error))
            .on('data', row => {

                let averageValues;

                if(type.includes('sub')){
                    if(row[0].includes('Average')){
                        let rawTotalPackets = row[1];

                        let expNumber = rawTotalPackets.substr(rawTotalPackets.indexOf('E') + 1, rawTotalPackets.length);

                        let totalPacketsDecimal = rawTotalPackets.substr(0, rawTotalPackets.indexOf('E'));

                        let normalTotalPackets;

                        if(expNumber.length < 4){
                            expNumber = parseInt(expNumber, 10);

                            normalTotalPackets = totalPacketsDecimal * Math.pow(10, expNumber);

                        }else{
                            normalTotalPackets = rawTotalPackets;
                        }

                        averageValues = {
                            path: pathValue,
                            totalPackets: Math.trunc(normalTotalPackets),
                            packetsPerSec: Math.trunc(row[2]),
                            throughput: Math.trunc(row[3])
                        };
                    }
                }else if(type.includes('pub')){
                    
                    if(row[0] != undefined && row[0].includes('Average')){
                        averageValues = {
                            path: pathValue,
                            averages: row[0] + row[1]
                        };
                    }
                }

                if(averageValues != undefined){
                    fs.appendFile('Averages.txt', JSON.stringify(averageValues) + '\n\n', err => err ? console.log(err) : console.log('Saved!'));
                }
            })
    }    
}
