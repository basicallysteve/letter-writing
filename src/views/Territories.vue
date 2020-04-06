<template>
    <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
        <div v-if="false" @click="addNewTerritory" style="display: flex; flex-flow: row; justify-content: flex-end;  margin-right: 1em; margin-bottom: 1em;">
            <b-button size="is-small" icon-left="plus">Add New Territory</b-button>
        </div>
        <territory v-for="territory in territories" 
        :key="territory.territory_id" :territory="territory" 
        @newTerritory="addTerritory" @deleteTerritory="removeTerritory" 
        :canCD="$attrs.user? $attrs.user.is_admin : false" :userId="$attrs.user ? $attrs.user.user_id : null" 
        @checkoutStreet="checkoutStreet" 
        @returnStreet="returnStreet" 
        @releaseStreet="release"
        :canCheckout="canCheckoutTerritory"/>
        
    </div>
</template>
<script>
import firebaseMixin from "@/mixins/firebase.mixin.js";

export default {
    components: {
        'territory': ()=>import("@/components/Territory")
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
            territoryListener: null
        }
    },
    methods: {
        addNewTerritory(){
            this.territories.push({})
        },
        checkoutStreet(territory, oldStreet, street){
            street.last_checkout = new Date();
            street.checked_out_by = this.$attrs.user.user_id;
            this.updateStreet(territory, oldStreet, street).then(()=>{
                this.downloadStreet(territory, street);
            })

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