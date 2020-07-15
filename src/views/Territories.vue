<template>
    <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
        <b-modal :active.sync="territory_form" has-modal-card>
            <territory-import @newTerritory="addNewTerritory" />
        </b-modal>
        <div style="display: flex; flex-flow: row; justify-content: flex-end;  margin-right: 1em; margin-bottom: 1em;">
            <b-button size="is-small" icon-left="plus" @click="createNewTerritory" v-if="user ? user.is_territory_servant || user.is_admin : false">Add Territory</b-button>
            <b-button size="is-small" icon-left="plus" @click="openTerritoryImportWindow" v-if="user ? user.is_territory_servant || user.is_admin : false">Import Territory</b-button>
        </div>
        <div style="display: flex; flex-flow: row; align-items: center; justify-content: flex-start; width: 100%;  margin-right: 1em; margin-bottom: 1em;">
           
            <territory-type-input @select="selectType" clearable/>
            <b-field  v-if="user ? user.is_territory_servant || user.is_admin : false" horizontal >
                <b-checkbox true-value="Available Territories" false-value="Unavaiable Territories" v-model="availability" style="white-space: nowrap;">View {{availability}}</b-checkbox>
            </b-field>
        </div>
        <div v-for="territory in territories" :key="territory.territory_id">
        <territory 
            :territory="territory" 
            @saveTerritory="saveTerritory"
            @deleteTerritory="removeTerritory" 
            @updateTerritory="updateTerritory"
            :canCD="user? user.is_admin || user.is_territory_servant : false" 
            :user="user" 
            @checkoutStreet="checkoutStreet" 
            @returnStreet="returnStreet" 
            @releaseStreet="release"
            :canCheckout="canCheckoutTerritory"
        />
        </div>
        
    </div>
</template>
<script>
import firebaseMixin from "@/mixins/firebase.mixin.js";
import classes from "@/classes/index";
var {User, Territory} = classes;
export default {
    components: {
        'territory': ()=>import("@/components/Territory"),
        'territory-import': ()=>import("@/components/TerritoryImport"),
        'territory-type-input': ()=>import("@/components/TerritoryTypeInput")
    },
    computed: {
        canCheckoutTerritory(){
            let doesntHaveTerritory = true;
            let checked_out_street;
            for(let territory of this.territories){
                territory._streets = territory._streets ? territory._streets : [];
                for(let street of territory._streets){
                    if(street.checked_out){
                        doesntHaveTerritory = street.checked_out_by != this.user.user_id && this.user.is_publisher && street.returned_at == null
                        if(!doesntHaveTerritory){
                            checked_out_street = street;
                        }
                    }
                }
                if(!doesntHaveTerritory){
                    break;
                }
            }
            return doesntHaveTerritory
        }
    },
    data(){
        return {
            territories: [],
            territory_form: false,
            territoryListener: null,
            availability: "Available Territories",
            queries: [],
        }
    },
    methods: {
        addNewTerritory(territory = {}){
            territory.is_visible = false;
            territory.deleted_at = null;
            this.territories.push(territory)
        },
        createNewTerritory(){
           let territory = {};
           territory.is_visible = false;
           territory.deleted_at = null;
           this.territories.push(new Territory(territory))
        },
        saveTerritory(territory){
            this.createTerritory(territory);
        },
        checkoutStreet(territory, oldStreet, street){
            street.last_checkout = new Date();
            street.checked_out_by = this.user.user_id;
            this.updateStreet(territory, oldStreet, street).then(()=>{
                this.downloadStreet(territory, street);
            })

        },
        openTerritoryImportWindow(){
            this.territory_form = true;
        },
        removeTerritory(territory_id){
            // this.deleteTerritory(territory_id)
        },
        loadTerritories(){
            let availabilityQuery = {
                name: "where",
                items: ["is_visible", "==", this.availability == "Available Territories" ] 
            }
            let queries = [availabilityQuery, ...this.queries];
            this.fetchTerritories(queries).then(response=>{
                this.territories = [];
                for(let territory of response){
                    this.territories.push(new Territory(territory));
                }
                
            })
        },
        release(territory, street){
            street.released_at = null;
            street.checked_out_name = null;
            street.checked_out_by = null;
            street.last_checkout = null;
            street.checked_out = false;
            street.returned_at = null;
            this.updateStreet(territory, null, street)
        },
        returnStreet(territory, oldStreet, street){
            street.returned_at = new Date();
            street.checked_out_by = null;
            this.updateStreet(territory, oldStreet, street)
            this.$forceUpdate();
        },
        selectType(type){
            if(!type){
                this.queries = this.queries.filter(query=>{
                    return !query.items.includes(`type_ref`);
                });
            }else{
                let type_ref = this.db.collection("territory-types").doc(type.territory_type_id);
                this.queries.push({
                    name: "where",
                    items: [`type_ref`, `==`, type_ref]
                });
            }
            this.loadTerritories();
        }
    },
    mixins: [firebaseMixin],
    mounted(){
        this.loadTerritories()
        this.territoryListener = this.onTerritoryUpdate(()=>{
            this.loadTerritories();
        })
    },
    props: {
        user: {
            type: Object,
            default(){
                return {
                    user_id: null
                }
            }
        },
    },
    watch: {
        availability(){
            this.loadTerritories();
        }
    }
}
</script>