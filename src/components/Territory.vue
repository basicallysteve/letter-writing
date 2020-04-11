<template>

    <b-collapse class="card" animation="slide" style="margin-bottom: 1em;" :open="false">
        <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button">
            <div class="card-header-title" style="display: flex; flex-flow: row; justify-content: space-between;" >
                {{formattedTerritory.territory_id ? formattedTerritory.name : "New Territory"}}
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
                    <div v-for="(street, index) in formattedTerritory.streets" :key="index" class="street">
                        <div style="margin-right: 1em;" class="info">
                            {{street.name}} | {{street.houses}} houses 
                            {{street.last_checkout != null ? `| Checked out at ${formatDate(street.last_checkout.toDate ? street.last_checkout.toDate() : null)} by ${street.checked_out_name}` : ""}}
                            {{street.returned_at != null ? `| Returned at ${formatDate(street.returned_at.toDate ? street.returned_at.toDate() : null)}` : ""}}</div>
                        <div class="actions">
                            <b-button :disabled="!$attrs.canCheckout || street.release_from_hold == false" v-if="!street.checked_out" @click="toggleCheckout(street.name, index)">Check Out</b-button>
                            <b-button @click="toggleCheckout(street.name, index)" v-else-if="street.checked_out_by == $attrs.userId">Return</b-button>
                            <b-button v-else disabled>Checked Out</b-button>
                            <b-button @click="releaseFromHold(street)" v-if="($attrs.canCD ? $attrs.canCD : false ) && street.returned_at != null && !street.release_from_hold">Release from Hold</b-button>
                        </div>
                        <hr />
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
                        this.$forceUpdate()
                    }
                }
            })()
            
            return territory;
        }
    },
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
        formatDate(date){
            return moment(date).format("MM/DD/Y")
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