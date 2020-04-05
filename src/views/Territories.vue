<template>
    <div>
        <div @click="addNewTerritory" style="display: flex; flex-flow: row; justify-content: flex-end;  margin-right: 1em; margin-bottom: 1em;">
            <b-button size="is-small" icon-left="plus">Add New Territory</b-button>
        </div>
        <territory v-for="territory in territories" :key="territory.erritory_id" :territory="territory" @newTerritory="addTerritory" @deleteTerritory="removeTerritory" :canCD="$attrs.user.is_admin" @checkoutStreet="checkoutStreet" @returnStreet="returnStreet"/>
        
    </div>
</template>
<script>
import firebaseMixin from "@/mixins/firebase.mixin.js";

export default {
    components: {
        'territory': ()=>import("@/components/Territory")
    },
    data(){
        return {
            territories: []
        }
    },
    methods: {
        addNewTerritory(){
            this.territories.push({})
        },
        checkoutStreet(territory, oldStreet, street){
            street.last_checkout = new Date();
            street.checked_out_by = this.$attrs.user.user_id;
            this.updateStreet(territory, oldStreet, street).then(response=>{
                this.downloadStreet(territory, street)
                this.loadTerritories();
            })

        },
        removeTerritory(territory_id){
            this.deleteTerritory(territory_id).then(response=>{
                this.loadTerritories();
            })
        },
        loadTerritories(){
            this.fetchTerritories().then(response=>{
                this.territories = response;
            });
        },
        returnStreet(territory, oldStreet, street){
            street.returned_at = new Date();
            street.checked_out_by = null;
            this.updateStreet(territory, oldStreet, street).then(response=>{
                this.loadTerritories();
            })
        }
    },
    mixins: [firebaseMixin],
    mounted(){
        this.loadTerritories()
    },
}
</script>