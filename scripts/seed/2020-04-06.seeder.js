let fs = require("fs");
let path = require("path");
let XLSX = require("xlsx");
let _ = require('lodash');
const dc = XLSX.utils.decode_cell,
      ec = (r, c) => { return XLSX.utils.encode_cell({r: r, c: c}); };
let firebase = require("firebase");
let {findSheet, findTable, readTable, admin} = require("./seeder");


async function importTerritories(){
    let seederPath = path.join(__dirname, "2020-04-06")
    let dir = await fs.promises.opendir(seederPath);
    for await(let dirent of dir){
        if(dirent.isDirectory()){
            let territory = {
                name: dirent.name,
                streets: [],
                congregation_id: "115774"
            }
            parseTerritory(path.join(seederPath, dirent.name), territory);
        }
    }
}

async function parseTerritory(fileDir, territory){
    let dir = await fs.promises.opendir(fileDir);
    for await(let dirent of dir){
        let street = {
            name: null,
            houses: null,
            checked_out: false,
            checked_out_by: false,
            release_from_hold: null,
            released_at: null,
            last_checkout: null,
            returned_at: null,
            pdf_format: true
        }

        if(dirent.isFile()){
            let workbook;
            try{
                workbook = XLSX.readFile(path.join(fileDir, dirent.name));
            }catch(err){
                console.log(err)
            }
            if(workbook){
                let {sheet, range} = findSheet(workbook, "Sheet1");
                if(sheet){
                    street.name = sheet.B1.v;
                    let colMap = {
                        num: "#"
                    }
                    let {columns, firstRow} = findTable(sheet, range, colMap);
                    const data = readTable(sheet, range, columns, firstRow, (row)=>false);
                    for(let house of data){
                        if(house.num){
                            street.houses += 1
                        }
                    }
                    territory.streets.push(street);

                    let pdfDir = path.join(fileDir, "PDF", dirent.name.replace(".xlsx", ".pdf"));
                    if(fs.existsSync(pdfDir)){
                        let storage = admin.storage().bucket();
                        let upload = storage.file(`territories/${territory.name}/${street.name}.pdf`);
                        let stream = upload.createWriteStream();
                        stream.end(fs.readFileSync(pdfDir));
                    }
                }
            }
        }
    }
    let db = admin.firestore();
    let newTerritoryRef = db.collection("/territories").doc();
    newTerritoryRef.set(territory).then(response=>{
        console.log(response)
    });
}

importTerritories();
// admin.firestore().collection("/congregations").get()