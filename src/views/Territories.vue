<template>
    <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
        <b-modal :active.sync="territory_form" has-modal-card>
            <territory-import @newTerritory="addNewTerritory" />
        </b-modal>
        <div style="display: flex; flex-flow: row; justify-content: flex-end;  margin-right: 1em; margin-bottom: 1em;">
            <b-button size="is-small" icon-left="plus" @click="openTerritoryImportWindow" v-if="user ? user.is_territory_servant || user.is_admin : false">Add New Territory</b-button>
        </div>
        <div v-for="territory in territories" :key="territory.territory_id">
        <territory 
         :territory="territory" 
  
        @saveTerritory="saveTerritory"
        @deleteTerritory="removeTerritory" 
        @updateTerritory="updateTerritory"
        :canCD="user? user.is_admin || user.is_territory_servant : false" 
        :userId="user.user_id" 
        @checkoutStreet="checkoutStreet" 
        @returnStreet="returnStreet" 
        @releaseStreet="release"
        :canCheckout="canCheckoutTerritory"/>
        </div>
        
    </div>
</template>
<script>
import firebaseMixin from "@/mixins/firebase.mixin.js";
export default {
    components: {
        'territory': ()=>import("@/components/Territory"),
        'territory-import': ()=>import("@/components/TerritoryImport")
    },
    computed: {
        canCheckoutTerritory(){
            let doesntHaveTerritory = true;
            let checked_out_street;
            for(let territory of this.territories){
                if(!territory.is_letter_writing){
                    for(let street of territory.streets){
                        if(street.checked_out){
                            doesntHaveTerritory = street.checked_out_by != this.user.user_id && this.user.is_publisher && street.returned_at == null
                            if(!doesntHaveTerritory){
                                checked_out_street = street;
                            }
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
            territoryListener: null
        }
    },
    methods: {
        addNewTerritory(territory = {}){
            this.territories.push(territory)
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
            this.fetchTerritories().then(response=>{
                this.territories = response;
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
    }
}
</script>