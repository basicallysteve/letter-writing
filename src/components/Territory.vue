<template>

    <b-collapse class="card mb-1" animation="slide" :open="false" @open="loadStreets">
        <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button">
            <div class="card-header-title territory-title header">
                {{territory.name ? territory.name : "New Territory"}}: 
                {{numberOfAvailableStreets}} streets available
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
                    <div class="row inputs" v-if="isSpecialUser">
                        <territory-type-input :defaultValue="territory.type ? territory.type.name : null"  @select="selectTerritoryType" style="width: 100%"/>
                        <b-field label="Available"  class="ml-1" horizontal><b-checkbox v-model="territory.is_visible" /></b-field>
                         <b-upload v-model="territory.file" accept=".pdf"  @input="updateMap($event)">
                                <a class="button is-primary">
                                    <b-icon icon="upload"></b-icon>
                                    <span>Upload Map</span>
                                </a>
                            </b-upload>
                    </div>
                    <div v-for="(street, index) in allStreets" :key="index" class="street">
                        <div class="info row mr-1" v-if="territory.territory_id && street.street_id">
                            {{street.name}} | {{street.houses}} houses 
                            {{street.last_checkout != null ? `| ${formatDate(street.last_checkout, "Checked out")} by ${street.checked_out_name}` : ""}}
                            {{street.returned_at != null ? `| ${formatDate(street.returned_at, "Returned")}` : ""}}
                        </div>
                        <div class="info inputs" v-else-if="street.street_id == null">
                            <b-input class="mr-1" type="text" v-model="street.name" placeholder="Main Street" />
                            <b-input class="mr-1" type="number" v-model="street.houses" placeholder="10 houses" />
                            <div>{{street.file ? street.file.name : null}}</div>
                        </div>
                        <div class="actions" v-if="territory.territory_id">
                            <b-button :disabled="!canCheckout || street.release_from_hold == false" v-if="!street.checked_out && !isSpecialUser" @click="toggleCheckout(street)">Check Out</b-button>
                            <b-button v-else-if="!isSpecialUser" disabled>Checked Out</b-button>
                            <b-button @click="toggleCheckout(street)" v-if="street.checked_out_by == user.user_id && street.checked_out == true">Return</b-button>
                            <b-button v-if="street.checked_out_by == user.user_id && street.checked_out == true && !isSpecialUser" @click="downloadStreet(territory, street)">
                                   View Street
                            </b-button>        
                        </div>
                        <div class="actions" v-else>
                            <b-upload v-model="street.file" accept=".pdf"  @input="uploadStreet($event, street)" :disabled="street.name == null">
                                <a class="button is-primary" :disabled="street.name == null">
                                    <b-icon icon="upload"></b-icon>
                                    <span>Upload Street</span>
                                </a>
                            </b-upload>
                            <b-button type="is-danger" icon-left="delete" @click="deleteStreet(street)">Delete Street</b-button>
                        </div>
                        <div class="mobile-actions">
                             <b-dropdown v-if="(territory.territory_id)">
                                <b-button slot="trigger" slot-scope="{ active }" :icon-left="active ? 'menu-up' : 'menu-down'">Actions</b-button>
                                <b-dropdown-item  aria-role="listitem" :disabled="!canCheckout || street.release_from_hold == false" v-if="!street.checked_out" @click="toggleCheckout(street)">Check Out</b-dropdown-item>
                                <b-dropdown-item  aria-role="listitem" v-else disabled>Checked Out</b-dropdown-item>
                                <b-dropdown-item  aria-role="listitem" v-if="street.checked_out_by == user.user_id && street.checked_out == true && !isSpecialUser" @click="downloadStreet(territory, street)">
                                   View Street
                                </b-dropdown-item>   
                                <b-dropdown-item aria-role="listitem" v-if="(street.checked_out_by == user.user_id || isSpecialUser) && street.checked_out" @click="toggleCheckout(street)">
                                    <label class="upload control">Return Street</label>
                                </b-dropdown-item>
                                <b-dropdown-item aria-role="listitem" v-if="street.returned_at != null && !street.release_from_hold && isSpecialUser" @click="releaseFromHold(street)">
                                    <label class="upload control">Release from Hold</label>
                                </b-dropdown-item>
                                <b-dropdown-item v-if="isSpecialUser" aria-role="listitem">
                                     <b-upload v-model="street.file" accept=".pdf"  @input="uploadStreet($event, street)" :disabled="street.name == null"  v-if="isSpecialUser">
                                         Upload Street
                                    </b-upload>
                                </b-dropdown-item>
                                <b-dropdown-item v-if="isSpecialUser" aria-role="listitem" @click="downloadStreet(territory, street)">
                                   <label class="upload control" > Preview Upload</label>
                                </b-dropdown-item>
                                <b-dropdown-item v-if="isSpecialUser" aria-role="listitem" @click="deleteStreet(street)"> Delete Street
                                </b-dropdown-item>
                            </b-dropdown>
                        </div>
                        <hr />
                    </div>
                    <b-button v-show="territory.has_map" icon-left="download" @click="checkoutTerritory" style="margin-right: 1em;">Download Map</b-button>
                    <b-button type="is-primary" icon-left="plus"  @click="addStreet" v-if="isSpecialUser" style="margin-right: 1em;">Add Street</b-button>
                    <b-button type="is-success" icon-left="floppy" @click="saveTerritory" v-if="isSpecialUser" style="margin-right: 1em;" :disabled="allStreets.length == 0">Save Territory</b-button>
                    <b-button type="is-danger" icon-left="delete" @click="deleteTerritory"  v-if="isSpecialUser" style="margin-right: 1em;">Delete Territory</b-button>
                    
                </div>
            </div>
        </div>
    </b-collapse>
</template>
<script>
import moment from "moment";
import firebaseMixin from "@/mixins/firebase.mixin";
import TerritoryTypeInput from "@/components/TerritoryTypeInput";
import territoryMixin from "@/mixins/territory.mixin";

export default {
    components: {
        TerritoryTypeInput
    },
    computed: {
        allStreets(){
            return [...this.newStreets, ...this.streets]
        },
        numberOfAvailableStreets(){
            let availableStreets = this.allStreets.filter(street=>{
                return street.checked_out != true && street.returned_at == null;
            })
            return availableStreets.length
        }
    },
    data(){
        return {
            newStreets: [],
            streets: []
        }
    },
    methods: {
        checkoutTerritory(){
            this.downloadMap(this.territory);
        },
        updateMap(event){
            this.saveFile(event, `territories/${this.territory.name}/map.pdf`).then(()=>{
                let territory = JSON.parse(JSON.stringify(this.territory));
                territory.has_map = true;
                this.$emit("updateTerritory", territory);
            });
        },
        addStreet(){
            this.newStreets.push({
                name: null,
                houses: 0,
                checked_out: false,
                checked_out_by: false,
                release_from_hold: null,
                released_at: null,
                last_checkout: null,
                returned_at: null,
                pdf_format: true,
                has_file: false,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            })
        },
        selectTerritoryType(type){
            let territory = Object.assign(this.territory);
            delete territory.type;
            territory.type_ref = this.db.collection("/territory-types").doc(type.territory_type_id);
            this.db.collection("/territories").doc(territory.territory_id).update(territory);
        },
        async saveTerritory(){
            for(let street of this.territory._streets){
                delete street.html;
                delete street.file;

                if(street.created_at == null){
                    street.created_at = new Date();
                }
                street.updated_at = new Date();
            }
            await this.addStreets(this.territory.territory_id,this.newStreets);
            this.newStreets = [];
            this.$emit("saveTerritory", this.territory)
        },
        deleteStreet(street){
            street.deleted_at = new Date();
            this.updateStreet(this.territory.territory_id, street);

            this.streets = this.streets.filter(s => s.street_id != street.street_id)
            if(this.territory.territory_id){
                this.$emit("saveTerritory", this.territory);
            }
        },
        deleteTerritory(){
            this.$emit("deleteTerritory", this.territory);
        },
        releaseFromHold(street){
            street.released_at = new Date();
            street.release_from_hold = true;
            street.last_checkout = null;
            street.returned_at = null;
            street.checked_out_by = null;
            street.checked_out_name = null;
            this.updateStreet(this.territory.territory_id, street);
        },
        toggleCheckout(street){
            street.checked_out = !street.checked_out;
            street.checked_out_by = this.user.user_id;
            if(street.checked_out){
                street.last_checkout = new Date();
                street.checked_out_name = this.user.name;

            }else{
                street.returned_at = new Date();
                street.release_from_hold = false;
            }
            this.updateStreet(this.territory.territory_id, street);
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
        },
        loadStreets(){
            this.fetchStreets(this.territory.territory_id).then((streets)=>{
                this.streets = streets;
            })
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
                    user_id: null
                }
            }
        },
        canCheckout: {
            type: Boolean,
            default: false
        },
        isSpecialUser: {
            type: Boolean,
            default: false
        }
    },
    watch:{
       'territory.is_visible': {
           handler(){
               let territory = Object.assign(this.territory);
               delete territory.type;
                this.db.collection("/territories").doc(territory.territory_id).update(territory);
           }
       }
    },
    mixins: [territoryMixin],
    mounted(){
        if(this.territory.territory_id){
            this.onTerritoryUpdate(this.territory.territory_id, this.loadStreet)
        }   
    }
}
</script>

<style lang="scss" scoped>

    .mb-1 {
        margin-bottom: 1em;
    }

    .ml-1 {
        margin-left: 1em;
    }

    .mr-1 {
        margin-right: 1em;
    }
    .row {
        display: flex; 
        flex-flow: row; 
        justify-content: space-between;
        &.inputs {
            margin-bottom: .5em;
        }
    }


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

        .mobile-actions {
            diplay: none;
        }

        @media screen and (max-width: 1366px){
            .territory-title {
                font-size: 14px;
            }
            .info {
                display: flex;
                font-size: 13px;
            }
            .actions {
                display: none;
            }

            .mobile-actions {
                width: 50%;
                display: flex;
                flex-flow: row;
                justify-content: flex-end;
                button {
                    margin-right: .5em;
                }
            }
        }


        
    }
</style>