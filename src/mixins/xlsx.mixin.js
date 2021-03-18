import XLSX from "xlsx";
import _ from "lodash";
const dc = XLSX.utils.decode_cell,
      ec = (r, c) => { return XLSX.utils.encode_cell({r: r, c: c}); };
export default {
    methods: {
        readStreet(file){
            return new Promise((resolve, reject)=>{
                let street = {
                    name: null,
                    houses: 0,
                    checked_out: false,
                    checked_out_by: false,
                    release_from_hold: null,
                    released_at: null,
                    last_checkout: null,
                    returned_at: null,
                    pdf_format: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null
                }
                const reader = new FileReader();
                reader.onload = ()=>{
                    let data = reader.result;
                    let workbook;
                    try{
                        workbook =  XLSX.read(data, {type: "binary"})
                    }catch(err){
                        console.log(err)
                    }
                    if(workbook){
                        let {sheet, range} = this.findSheet(workbook, "Sheet1");
                        if(sheet){
                            street.name = sheet.B1.v;
                            let colMap = {
                                num: "#"
                            }
                            let {columns, firstRow} = this.findTable(sheet, range, colMap);
                            const data = this.readTable(sheet, range, columns, firstRow, (row)=>false);
                            for(let house of data){
                                if(house.num){
                                    street.houses += 1
                                }
                            }
                            let html = XLSX.utils.sheet_to_html(sheet);
                            street.html = html;
                        }
                    }

                    
                    resolve(street)
                }
                reader.readAsBinaryString(file);
            })
            
        },
        /**
             * Find a sheet in the workbook by name, and return an object with keys
             * `sheet` and `range`, where `range` is an object describing the valid cells
             * of the sheet, like `{min: {r: 1, c: 1}, max: {r: 5, c:5}}`.
             */
            findSheet(workbook, sheetName) {
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
            },

            /**
             * Find the start position of a table in the given sheet. `colMap` describes
             * the table columns as an object with key prop -> column title. Returns an
             * object with keys `columns` (maps prop -> 0-indexed column number) and
             * `firstRow`, the number of the first row of the table (will be `null`) if the
             * table was not found.
             */
            // colMap: prop -> col name
            findTable(sheet, range, colMap) {
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
            },

            /**
             * Given the `cols` and `firstRow` as returned by `findTable()`, return a list
             * of objects of all table values. Continues to the end of the sheet unless
             * passed a function `stop` that takes a mapped row object as an argument and
             * returns `true` for that row.
             */
            readTable(sheet, range, columns, firstRow, stop) {
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
    }
}