let fs = require("fs");
let path = require("path");

let XLSX = require("xlsx");
let _ = require('lodash');
const dc = XLSX.utils.decode_cell,
      ec = (r, c) => { return XLSX.utils.encode_cell({r: r, c: c}); };


let firebase = require("firebase");
let admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  apiKey: "AIzaSyAFHTI9Sc-DjGHz2oo-w5Cvw30bXeSMgxI",
    authDomain: "localhost",
    databaseUrl: "",
    projectId: "letter-writing-app",
    storageBucket: "gs://letter-writing-app.appspot.com",
    messageSenderId: ""
});





async function parseTerritory(fileDir, territory){
    let dir = await fs.promises.opendir(fileDir);
    for await(let dirent of dir){
        if(dirent.isFile()){
            try{
            let street = {
                name: null,
                houses: 0,
                checked_out: false,
                last_checkout: null,
                returned_at: null
            };
            let workbook = XLSX.readFile(path.join(fileDir, dirent.name));

            let {sheet, range} = findSheet(workbook, "Sheet1");

            let colMap = {
                num: 'House #',
                name: 'Name',
                phone: "Phone",
                notes: "Notes"
            }

            let {columns, firstRow} = findTable(sheet, range, colMap)
            const data = readTable(sheet, range, columns, firstRow, (row) => false);
            for(let house of data){
                if(house.num){
                    street.houses += 1
                }
            }
            street.name = workbook.Sheets.Sheet1.B1.v;
            territory.streets.push(street);
            let storage = admin.storage().bucket();
            let upload = storage.file(`territories/${territory.name}/${street.name}.xlsx`);
            let stream = upload.createWriteStream();

            stream.end(fs.readFileSync(path.join(__dirname, territory.name, `${dirent.name}`)));
            }catch(err){
                console.log(err);
            }
        }
        
    }

    let db = admin.firestore();
    let newTerritoryRef = db.collection("/territories").doc();
    newTerritoryRef.set(territory).then(response=>{
        console.log(response)
    });

}


async function importSeeder(){
    let dir = await fs.promises.opendir(__dirname);
    for await(let dirent of dir){
        if(dirent.isDirectory()){
            let territory = {
                name: dirent.name,
                streets: []
            }
            parseTerritory(path.join(__dirname, dirent.name), territory);

        }
    }
}

importSeeder()



///Helpers

/**
 * Find a sheet in the workbook by name, and return an object with keys
 * `sheet` and `range`, where `range` is an object describing the valid cells
 * of the sheet, like `{min: {r: 1, c: 1}, max: {r: 5, c:5}}`.
 */
function findSheet(workbook, sheetName) {
    let sheet = workbook.Sheets[sheetName],
        range = {min: {r: 0, c: 0}, max: {r: 0, c: 0}};

    if(!sheet) {
        return { sheet: null, range: null };
    }

    // find size of the sheet
    let ref = sheet['!ref'];

    if(!ref && ref.indexOf(':') === -1) {
        throw new Error("Malformed workbook - no !ref property");
    }

    range.min = dc(ref.split(':')[0]);
    range.max = dc(ref.split(':')[1]);

    return { sheet, range };
}

/**
 * Find the start position of a table in the given sheet. `colMap` describes
 * the table columns as an object with key prop -> column title. Returns an
 * object with keys `columns` (maps prop -> 0-indexed column number) and
 * `firstRow`, the number of the first row of the table (will be `null`) if the
 * table was not found.
 */
// colMap: prop -> col name
function findTable(sheet, range, colMap) {
    let firstRow = null,
        colsToFind = _.keys(colMap).length,

        // colmap lowercase title -> prop
        colLookup = _.reduce(colMap, (m, v, k) => { m[_.isString(v)? v.toLowerCase() : v] = k; return m; }, {}),

        // colmap props -> 0-indexed column
        columns = _.reduce(colMap, (m, v, k) => { m[k] = null; return m; }, {});

    // Look for header row and extract columns
    for(let r = range.min.r; r <= range.max.r - 1; ++r) {
        let colsFound = 0;

        for(let c = range.min.c; c <= range.max.c; ++c) {
            let cell = sheet[ec(r, c)];

            if(cell && cell.v !== undefined) {
                let prop = colLookup[cell.t === 's'? cell.v.toLowerCase() : cell.v];
                if(prop) {
                    columns[prop] = c;
                    ++colsFound;
                }
            }
        }

        if(colsFound === colsToFind) {
            firstRow = r + 1;
            break;
        }
    }

    return { columns, firstRow };
}

/**
 * Given the `cols` and `firstRow` as returned by `findTable()`, return a list
 * of objects of all table values. Continues to the end of the sheet unless
 * passed a function `stop` that takes a mapped row object as an argument and
 * returns `true` for that row.
 */
function readTable(sheet, range, columns, firstRow, stop) {
    let data = [];

    for(let r = firstRow; r <= range.max.r; ++r) {
        let row = _.reduce(columns, (m, c, k) => {
            let cell = sheet[ec(r, c)];
            m[k] = cell? cell.v : null;
            return m;
        }, {});

        if(stop && stop(row)) {
            break;
        }

        data.push(row);
    }

    return data;
}