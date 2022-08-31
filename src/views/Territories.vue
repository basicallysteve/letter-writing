<template>
    <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
        <b-modal :active.sync="territory_form" has-modal-card>
            <territory-import @newTerritory="addNewTerritory" />
        </b-modal>
        <div style="display: flex; flex-flow: row; justify-content: flex-end;  margin-right: 1em; margin-bottom: 1em;">
            <b-button size="is-small" icon-left="plus" @click="openTerritoryImportWindow" v-if="user ? user.is_territory_servant || user.is_admin : false">Add New Territory</b-button>
        </div>
        <div style="display: flex; flex-flow: row; align-items: center; justify-content: flex-start; width: 100%;  margin-right: 1em; margin-bottom: 1em;">
           
            <territory-type-input @select="selectType" clearable/>
            <b-input placeholder="Search Street" style="margin-left: 1em;" v-model="searchedStreet" disabled/>
            <b-field  v-if="user ? user.is_territory_servant || user.is_admin : false" horizontal >
                <b-checkbox true-value="Available Territories" false-value="Unavaiable Territories" v-model="availability" style="white-space: nowrap;">View {{availability}}</b-checkbox>
            </b-field>
        </div>
        <div v-for="territory in filteredTerritories" :key="territory.territory_id">
        <territory 
         :territory="territory" 
  
        @saveTerritory="saveTerritory"
        @deleteTerritory="removeTerritory" 
        @updateTerritory="updateTerritory"
        :isSpecialUser="user? user.is_admin || user.is_territory_servant : false" 
        :user="user" 
        @checkoutStreet="checkoutStreet" 
        @returnStreet="returnStreet" 
        @releaseStreet="release"
        :canCheckout="canCheckoutTerritory"/>
        </div>
        
    </div>
</template>
<script>
import territoryMixin from "@/mixins/territory.mixin.js";
export default {
    components: {
        'territory': ()=>import("@/components/Territory"),
        'territory-import': ()=>import("@/components/TerritoryImport"),
        'territory-type-input': ()=>import("@/components/TerritoryTypeInput")
    },
    computed: {
        canCheckoutTerritory(){
            return this.user.num_of_checked_out_streets < this.user.max_number_of_streets;
        },
        filteredTerritories(){
            if(this.searchedStreet == null || this.searchedStreet.trim() == ""){
                return this.territories;
            }
            let territories = [];
            for(let territory of this.territories){
                let matchesSearch = territory._streets.findIndex(street=>{
                    return street.name.toLowerCase().startsWith(this.searchedStreet.toLowerCase());
                })

                if(matchesSearch > -1){
                    territories.push(territory);
                }
            }

            return territories;
        }
    },
    data(){
        return {
            territories: [],
            territory_form: false,
            territoryListener: null,
            availability: "Available Territories",
            queries: [],
            searchedStreet: null
        }
    },
    methods: {
        addNewTerritory(territory = {}){
            territory.is_visible = false;
            territory.deleted_at = null;
            this.territories.push(territory)
        },
        saveTerritory(territory){
            if(!territory.territory_id){
                this.createTerritory(territory);
            }else{
                this.updateTerritory(territory);
            }
        },
        checkoutStreet(territory, oldStreet, street){
            street.last_checkout = new Date();
            street.checked_out_by = this.user.user_id;
            this.user.num_of_checked_out_streets = this.user.num_of_checked_out_streets ? this.user.num_of_checked_out_streets+1 : 1; 
            this.updateStreet(territory, oldStreet, street, street.checked_out_by, true).then(()=>{
                this.downloadStreet(territory, street);
            })

        },
        openTerritoryImportWindow(){
            this.territory_form = true;
        },
        removeTerritory(territory){
            if(territory.territory_id){
                territory.deleted_at = new Date();
                this.updateTerritory(territory);
                for(let street of territory._streets){
                    try{
                        this.deleteFile(`territories/${territory.name}/${street.name}.pdf`)
                    }catch(err){
                        console.log(err);
                    }
                }
            }
        },
        loadTerritories(){
            let availabilityQuery = {
                name: "where",
                items: ["is_visible", "==", this.availability == "Available Territories" ] 
            }
            let queries = [availabilityQuery, ...this.queries];
            this.fetchTerritories(queries).then(response=>{
                this.territories = response ? response : [];
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
            this.user.num_of_checked_out_streets = this.user.num_of_checked_out_streets ? this.user.num_of_checked_out_streets-1 : 0; 

            this.updateStreet(territory, oldStreet, street, street.checked_out_by)
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
    mixins: [territoryMixin],
    mounted(){
        this.loadTerritories()
    },
    props: {
        user: {
            type: Object,
            default(){
                return {
                    user_id: null,
                    max_number_of_streets: 1,
                    num_of_checked_out_streets: 0
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