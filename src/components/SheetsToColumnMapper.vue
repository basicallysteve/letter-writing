<template>
<div v-if="headerRow.length > 0">
    <b-table :data="headerRow" class="m-b-8">
        <template slot-scope="props">
            <b-table-column field="header" label="Header" width="50">{{props.row.field}}</b-table-column>
            <b-table-column field="column" label="Column" width="50">
                <b-select v-model="props.row.databaseField">
                    <option v-for="(col, index) in databaseColumns" :key="index">{{col}}</option>
                </b-select>
            </b-table-column>
            <b-table-column field="example" label="Example">{{props.row.example}}</b-table-column>
            <b-table-column field="default" label="Default To">
                <b-select>
                    <option>NULL</option>
                    <option>Current Date</option>
                </b-select>
            </b-table-column>
        </template>
    </b-table>
    <div class="flex-row right-justified">
        <b-button type="is-primary">Begin Import</b-button>
    </div>
</div>
</template>
<script>
import XLSX from "xlsx";
const dc = XLSX.utils.decode_cell,
      ec = (r, c) => { return XLSX.utils.encode_cell({r: r, c: c}); };
export default {
    data(){
        return {
            workbook: null,
            headerRow: []
        }
    },
    methods: {
        readFile(file){
            return new Promise((resolve, reject)=>{
                
                const reader = new FileReader();
                reader.onload = ()=>{
                    let data = reader.result;
                    try{
                        this.workbook =  XLSX.read(data, {type: "binary"})
                    }catch(err){
                        console.log(err)
                    }
                    resolve(this.workbook)
                }
                reader.readAsBinaryString(file);
            })
        },
        getHeaders(sheet) {
            var headers = [];
            var range = XLSX.utils.decode_range(sheet['!ref']);
            var C, R = range.s.r; /* start in the first row */
            /* walk every column in the range */
            for(C = range.s.c; C <= range.e.c; ++C) {
                var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */

                var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
                if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);

                headers.push({field: hdr, databaseField: null});
            }
            
            return headers;
        },

        getSampleRow(){
            let columnMapper = {};
            for(let header of this.headerRow){
                columnMapper[header.field] = header.field
            }
            let {range, sheet} = this.findSheet(this.workbook, "Sheet1");
            let {columns, firstRow} = this.findTable(sheet, range, columnMapper);
            let data = this.readTable(sheet, range, columns, firstRow, (row)=>false);
            let first = data.find(row=>{
                return Object.keys(row).every(key=>{
                    return row[key] != null;
                })
            });
            for(let header of this.headerRow){
                try{    
                    header.example = first[header.field];
                }catch(err){
                    header.example = "No Data Found";
                }
            }
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
                colsToFind = window._.keys(colMap).length,

                // colmap lowercase title -> prop
                colLookup = window._.reduce(colMap, (m, v, k) => { m[_.isString(v)? v.toLowerCase() : v] = k; return m; }, {}),

                // colmap props -> 0-indexed column
                columns = window._.reduce(colMap, (m, v, k) => { m[k] = null; return m; }, {});

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
                let row = window._.reduce(columns, (m, c, k) => {
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
    },
    props: {
        file: {
            type: File,
            default(){
                return null;
            }
        },
        databaseColumns: {
            type: Array,
            default(){
                return ["A", "B", "C"];
            }
        }
    },
    mounted(){
    },
    watch: {
        'file': {
            handler(newVal){
                this.readFile(newVal).then(response=>{
                    this.headerRow = this.getHeaders(response.Sheets.Sheet1)
                    this.getSampleRow();

                })
            }
        }
    }
}
</script>