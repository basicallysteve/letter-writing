<template>
<div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
     <div v-for="(territory, index) of territories" :key="territory.territory_id">
     <tile :title="territory.name"  style="width:100%" vertical>
        <template #content>
            <div style="display: flex; flex-flow: row; justify-content: center">Location: City | State | Country, ZIP</div>
            <div style="display: flex; flex-flow: row; justify-content: flex-end">
                <router-link to="territory" :params="{reference: territory.reference}">View Territory</router-link>
            </div>
        </template>
    </tile>    
    <hr v-if="index != territories.length - 1" />
    </div>
</div>
   
</template>
<script>
import Tile from "@/components/Tile";
import classes from "@/classes/index";
import firebaseMixin from "@/mixins/firebase.mixin.js";
var {User, Territory} = classes;

export default {
    components: {
        Tile
    },
    data(){
        return {
            queries: [],
            territories: [],
            availability: "Available Territories",

        }
    },
    methods: {
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
        }
    },
    mixins: [firebaseMixin],
    mounted(){
        this.loadTerritories();
    }
}
</script>