<template>
    <form>
        <div class="modal-card" id="import-window">
            <header class="modal-card-head">
                <p class="modal-card-title">Territory Import</p>
            </header>
            <section class="modal-card-body">
                <b-field label="Territory Name">
                    <b-input
                        type="text"
                        v-model="territory.name"
                        placeholder="Territory 05"
                        required>
                    </b-input>
                </b-field>

                <b-field style="display: flex; flex-flow: column">
                    <template #label>
                        <b-tooltip label="Due to unpredicatble formatting of territories, the import might fail. You will be asked to confirm everything before finalizing the import" position="is-left" multilined>Streets</b-tooltip>
                    </template>
                    <b-upload
                        v-model="territory.streetFiles"
                        drag-drop
                        multiple
                        accept=".xlsx"
                        @input="readFiles"
                        required>
                        <section class="section">
                            <div class="content has-text-centered">
                                <p>
                                    <b-icon
                                        icon="upload"
                                        size="is-large">
                                    </b-icon>
                                </p>
                                <p>Drop your excel territory sheets here</p>
                            </div>
                        </section>
                    </b-upload>
                    <div class="tags">
                    <span v-for="(file, index) in files"
                        :key="index"
                        class="tag is-primary" >
                        {{file.name}}
                    </span>
        </div>
                </b-field>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$parent.close()">Close</button>
                <b-button type="is-primary" :loading="isLoading" @click="importTerritory">Import</b-button>
            </footer>
        </div>
    </form>
</template>
<script>
import xlsx from "@/mixins/xlsx.mixin.js";
import firebase from "@/mixins/firebase.mixin.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import fb from "@/firebaseConfig.js";

window.html2canvas = html2canvas;
export default {
    computed: {
    },
    data(){
        return {
            file: null,
            isLoading: false,
            territory: {
                name: null,
                _streets: [],
                streetFiles: []
            },
            files : [],
        }
    },
    methods: {
        async readFiles(){
            this.isLoading = true;
            for await(let file of this.territory.streetFiles){
                this.readStreet(file).then(street=>{
                    this.territory._streets.push(street);
                    // let el = document.createElement("div");
                    // el.innerHTML = street.html.trim();
                    // el.setAttribute("style", "z-index: -1");
                    // let importWin = document.getElementById("import-window");
                    // importWin.appendChild(el);
                    // html2canvas(el)
                    // .then((canvas) => {
                        // importWin.removeChild(el);
                        // const img = canvas.toDataURL('image/png')
                        // const pdf = new jsPDF({
                        //     orientation: "p",
                        //     format: "a4"
                        // })
                        // const imgProps= pdf.getImageProperties(img);
                        // const width = pdf.internal.pageSize.getWidth();
                        // const height = (imgProps.height * width) / imgProps.width;
                        // pdf.addImage(img, 'JPEG', 0, 0, width, height)
                        // pdf.save('your-filename.pdf')
                        // let fileBlob = pdf.output("blob");
                    // })
                    
                })
            }
            this.isLoading = false;
            this.files = [...this.files, ...this.territory.streetFiles];
            this.territory.streetFiles = [];

        },
        importTerritory(){
            delete this.territory.streetFiles;
            this.$emit("newTerritory", this.territory);
            this.$parent.close()
        },
        deleteDropFile(index) {
            this.territory.streetFiles.splice(index, 1)
        }
    },

    mixins: [firebase, xlsx]

}
</script>