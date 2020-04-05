<template>

    <b-collapse class="card" animation="slide" style="margin-bottom: 1em;">
        <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button">
            <div class="card-header-title" style="display: flex; flex-flow: row; justify-content: space-between;" >
                {{territory.territory_id ? territory.name : "New Territory"}}
            </div>
            
            <a class="card-header-icon">
                <b-icon
                    :icon="props.open ? 'menu-down' : 'menu-up'">
                </b-icon>
            </a>
        </div>
        <div class="card-content">
            <div class="content">
                <div v-if="territory.territory_id">
                    <div v-for="(street, index) in territory.streets" :key="index" class="street">
                        <div style="margin-right: 1em;">
                            {{street.name}} | {{street.houses}} houses 
                            {{street.last_checkout ? `| Checked out at ${street.last_checkout.toDate()}` : ""}}
                            {{street.returned_at ? `| Returned at ${street.returned_at.toDate()}` : ""}}</div>
                        <b-button v-if="!street.checked_out" @click="toggleCheckout(street.name, index)">Check Out</b-button>
                        <b-button @click="toggleCheckout(street.name, index)" v-else>Return</b-button>
                    </div>
                    <b-button type="is-danger" icon-left="delete" @click="deleteTerritory" v-if="$attrs.canCD"/>
                </div>
                <div v-else>
                    <form @submit.prevent="newTerritory(territory)">
                        <div>
                            <b-field label="Territory">
                                <b-input v-model="territory.name" />  
                            </b-field>
                            <b-button native-type="submit">Save</b-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </b-collapse>
</template>
<script>
export default {
    data(){
        return {
            
        }
    },
    methods: {
        newTerritory(){
            this.$emit("newTerritory", this.territory)
        },
        deleteTerritory(){
            this.$emit("deleteTerritory", this.territory.territory_id);
        },
        toggleCheckout(streetName, index){
            for(let street of this.territory.streets ){
                if(street.name == streetName){
                    let oldStreet = JSON.parse(JSON.stringify(street));
                    street.checked_out = !street.checked_out;
                    if(street.checked_out){
                        this.$emit("checkoutStreet", this.territory, oldStreet, street);
                    }else{
                        this.$emit("returnStreet", this.territory, oldStreet, street)
                    }
                }
            }
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
        }
    },
    watch:{
        territory: {
            deep: true,
            handler(){
                this.$emit("territoryUpdated", this.territory);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .street {
        display: flex; 
        flex-flow: row; 
        align-items: center;
        justify-content: space-between;
        margin: 1em;
    }
</style>