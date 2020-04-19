<template>
    <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
        <b-modal :active.sync="territory_form" has-modal-card>
            <territory-import @newTerritory="addNewTerritory" />
        </b-modal>
        <div style="display: flex; flex-flow: row; justify-content: flex-end;  margin-right: 1em; margin-bottom: 1em;">
            <b-button size="is-small" icon-left="plus" @click="openTerritoryImportWindow" v-if="$attrs.user ? $attrs.user.is_territory_servant || $attrs.user.is_admin : false">Add New Territory</b-button>
        </div>
        <div v-for="territory in territories" :key="territory.territory_id">
        <territory 
         :territory="territory" 
        @saveTerritory="saveTerritory"
        @deleteTerritory="removeTerritory" 
        @updateTerritory="updateTerritory"
        :canCD="$attrs.user? $attrs.user.is_admin || $attrs.user.is_territory_servant : false" :userId="$attrs.user ? $attrs.user.user_id : null" 
        @checkoutStreet="checkoutStreet" 
        @returnStreet="returnStreet" 
        @releaseStreet="release"
        :canCheckout="canCheckoutTerritory" v-if="!territory.is_letter_writing"/>
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
            for(let territory of this.territories){
                for(let street of territory.streets){
                    doesntHaveTerritory = this.$attrs.user ? street.checked_out_by != this.$attrs.user.user_id && this.$attrs.user.is_publisher : false;
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
            street.checked_out_by = this.$attrs.user.user_id;
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
            if(this.$attrs.user){
                this.fetchTerritories(this.$attrs.user.congregation_id).then(response=>{
                    this.territories = response;
                })
            }
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
        }
    },
    mixins: [firebaseMixin],
    mounted(){
        this.loadTerritories()
        this.territoryListener = this.onTerritoryUpdate(()=>{
            this.loadTerritories();
        })

    },
}
</script>