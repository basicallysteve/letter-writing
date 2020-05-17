<template>

    <b-collapse class="card" animation="slide" style="margin-bottom: 1em;" :open="false">
        <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button">
            <div class="card-header-title" style="display: flex; flex-flow: row; justify-content: space-between;" >
                {{formattedTerritory.name ? formattedTerritory.name : "New Territory"}}
                <b-field label="Available" horizontal><b-checkbox v-model="territory.is_visible"/></b-field>
            </div>
            
            <a class="card-header-icon">
                <b-icon
                    :icon="props.open ? 'menu-down' : 'menu-up'">
                </b-icon>
            </a>
        </div>
        <div class="card-content">
            <div class="content">
                <div>
                    <div v-for="(street, index) in formattedTerritory.streets" :key="index" class="street">
                        <div style="margin-right: 1em;" class="info" v-if="territory.territory_id">
                            {{street.name}} | {{street.houses}} houses 
                            {{street.last_checkout != null ? `| ${formatDate(street.last_checkout, "Checked out")} by ${street.checked_out_name}` : ""}}
                            {{street.returned_at != null ? `| ${formatDate(street.returned_at, "Returned")}` : ""}}
                        </div>
                        <div class="info inputs" v-else>
                            <b-input type="text" v-model="street.name" placeholder="Main Street" style="margin-right: 1em;"/>
                            <b-input type="number" v-model="street.houses" placeholder="10 houses" style="margin-right: 1em;"/>
                            <div>{{street.file ? street.file.name : null}}</div>
                        </div>
                        <div class="actions" v-if="territory.territory_id">
                            <b-button :disabled="!canCheckout || street.release_from_hold == false" v-if="!street.checked_out" @click="toggleCheckout(street.name, index)">Check Out</b-button>
                            <b-button @click="toggleCheckout(street.name, index)" v-else-if="street.checked_out_by == $attrs.userId">Return</b-button>
                            <b-button v-else disabled>Checked Out</b-button>
                            <b-dropdown v-if="($attrs.canCD ? $attrs.canCD : false )">
                                <b-button slot="trigger" slot-scope="{ active }" :icon-left="active ? 'menu-up' : 'menu-down'">Actions</b-button>
                                <b-dropdown-item aria-role="listitem" v-if="street.checked_out" @click="returnStreet(street.name, index)">
                                    <label class="upload control">Return Street</label>
                                </b-dropdown-item>
                                <b-dropdown-item aria-role="listitem" v-if="street.returned_at != null && !street.release_from_hold" @click="releaseFromHold(street)">
                                    <label class="upload control">Release from Hold</label>
                                </b-dropdown-item>
                                <b-dropdown-item aria-role="listitem">
                                     <b-upload v-model="street.file" accept=".pdf"  @input="uploadStreet($event, street)" :disabled="street.name == null"  v-if="$attrs.canCD">
                                         Upload Street
                                    </b-upload>
                                     </b-dropdown-item>
                            </b-dropdown>
                        </div>
                        <div class="actions" v-else>
                            <b-upload v-model="street.file" accept=".pdf"  @input="uploadStreet($event, street)" :disabled="street.name == null">
                                <a class="button is-primary" :disabled="street.name == null">
                                    <b-icon icon="upload"></b-icon>
                                    <span>Upload Street</span>
                                </a>
                            </b-upload>
                            <b-button type="is-danger" icon-left="delete" @click="deleteStreet(index)">Delete Street</b-button>
                        </div>
                        <hr />
                    </div>
                    <b-button type="is-primary" icon-left="plus"  @click="addStreet" v-if="$attrs.canCD && territory.territory_id == null" style="margin-right: 1em;">Add Street</b-button>
                    <b-button type="is-success" icon-left="floppy" @click="saveTerritory" v-if="$attrs.canCD && territory.territory_id == null" style="margin-right: 1em;" :disabled="territory.streets.length == 0">Save Territory</b-button>
                    <b-button type="is-danger" icon-left="delete" @click="deleteTerritory"  v-if="$attrs.canCD && territory.territory_id == null" disabled style="margin-right: 1em;">Delete Territory</b-button>
                    
                </div>
            </div>
        </div>
    </b-collapse>
</template>
<script>
import moment from "moment";
import firebaseMixin from "@/mixins/firebase.mixin";
export default {
    computed: {
        formattedTerritory(){
            let territory = this.territory;
            (async ()=>{
                for await(let street of this.territory.streets){
                    let user = street.checked_out_by ? await this.fetchUserById(street.checked_out_by) : null;
                    if(user != null){
                        street.checked_out_name = user.data().name;
                    }
                }
                this.$forceUpdate();
            })()
            
            return territory;
        }
    },
    data(){
        return {
            
        }
    },
    methods: {
        addStreet(){
            this.territory.streets.push({
                name: null,
                houses: 0,
                checked_out: false,
                checked_out_by: false,
                release_from_hold: null,
                released_at: null,
                last_checkout: null,
                returned_at: null,
                pdf_format: true
            })
        },
        saveTerritory(){
            for(let street of this.territory.streets){
                delete street.html;
                delete street.file;
            }
            this.$emit("saveTerritory", this.territory)
        },
        deleteStreet(index){
            let streets = [];
            for(let i = 0; i < this.territory.streets.length; i++){
                if(i != index){
                    streets.push(this.territory.streets[i]);
                }
            }
            this.deleteFile(`territories/${this.territory.name}/${this.territory.streets[index].name}.pdf`).then(response=>{
            }).catch(err=>{

            })

            this.territory.streets = streets;
        },
        deleteTerritory(){
            this.$emit("deleteTerritory", this.territory.territory_id);
        },
        releaseFromHold(street){
            street.release_from_hold = true;
            this.$emit("releaseStreet", this.territory, street);
        },
        toggleCheckout(streetName, index){
            for(let street of this.territory.streets ){
                if(street.name == streetName){
                    let oldStreet = JSON.parse(JSON.stringify(street));
                    street.checked_out = !street.checked_out;
                    if(street.checked_out){
                        street.release_from_hold = false;
                        this.$emit("checkoutStreet", this.territory, oldStreet, street);
                    }else{
                        this.$emit("returnStreet", this.territory, oldStreet, street)
                    }
                }
            }
        },
        returnStreet(streetName, index){
            for(let street of this.territory.streets ){
                if(street.name == streetName){
                    let oldStreet = JSON.parse(JSON.stringify(street));
                    street.checked_out = false;
                    this.$emit("returnStreet", this.territory, oldStreet, street)
                }
            }
        },
        uploadStreet(event, street){
            this.saveFile(event, `territories/${this.territory.name}/${street.name}.pdf`).then(()=>{
                street.file_uploaded = true;
                street.pdf_format = true;
                street.file = null;
                let territory = JSON.parse(JSON.stringify(this.territory));
                this.$emit("updateTerritory", territory);
            });
        },
        formatDate(date, text){
            if(!date){
                return null
            }else if(!date.toDate){
                return text
            }
            return `${text} at ${moment(date.toDate()).format("MM/DD/Y")}`;
        }
    },
    props: {
        territory: {
            type: Object,
            default(){
                return {
                    streets: []
                }
            }
        },
        user: {
            type: Object,
            default(){
                return {
                    user_id:null
                }
            }
        },
        canCheckout: {
            type: Boolean,
            default: false
        }
    },
    watch:{
        territory: {
            deep: true,
            handler(){
                console.log(this.territory)
                this.$emit("territoryUpdated", this.territory);
            }
        }
    },
    mixins: [firebaseMixin]
}
</script>

<style lang="scss" scoped>
    .street {
        display: flex; 
        flex-flow: row; 
        align-items: center;
        justify-content: space-between;
        margin: 1em;
        .info {
            width: 70%;
            text-align:left;
            &.inputs {
                display: flex;
                flex-flow: row nowrap;
            
            }
        }
        .actions {
            width: 50%;
            display: flex;
            flex-flow: row;
            justify-content: flex-end;
            button {
                margin-right: .5em;
            }
        }
    }
</style>