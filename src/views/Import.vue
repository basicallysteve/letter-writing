<template>
<div style="margin-bottom: 1em;">
    <div style="display: flex' flex-flow: row">
    <b-field label="Import ...">
        <b-select >

        </b-select>
    </b-field>
    <b-tooltip label="This importer only works with flat, single sheet spreadsheets">
        <b-upload
            v-model="file"
            drag-drop
            accept=".xlsx,.csv"
            @input="readFiles"
            required>
            <a> File Upload</a>
        </b-upload>
    </b-tooltip>
    </div>
    <div>
        <sheet-mapper :file="file" />
    </div>
</div>
</template>
<script>
import SheetMapper from "@/components/SheetsToColumnMapper";

export default {
    components: {
        SheetMapper
    },
    data(){
        return {
            module: ,
            file: null
        }
    },
}
</script>