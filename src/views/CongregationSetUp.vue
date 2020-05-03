<template>
<div>
     <form @submit.prevent>
        <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
            <b-field label="Name">
                <b-input v-model="congregation.name" type="text" placeholder="East Bloomingburg Congregation"/>
            </b-field>
            <div style="display: flex; flex-flow: column;">
                <div style="display: flex; flex-flow: row;">
                    <b-field label="Street" style="width: 50%; margin-right: 1em;">
                        <b-input v-model="congregation.address.street" type="text" placeholder="123 Main Street" id="autocomplete"/>
                    </b-field>
                    <b-field label="City" style="width: 50%; margin-right: 1em;">
                        <b-input v-model="congregation.address.city" type="text" placeholder="New York City"/>
                    </b-field>
                </div>
                <div style="display: flex; flex-flow: row;">
                <b-field label="State" style="width: 50%; margin-right: 1em;">
                    <b-input v-model="congregation.address.state" type="text" placeholder="New York"/>
                </b-field>
                <b-field label="Country" style="width: 50%; margin-right: 1em;">
                    <b-input v-model="congregation.address.country" type="text" placeholder="United States"/>
                </b-field>
                </div>
                <b-field label="Zipcode">
                    <b-input v-model="congregation.address.zip_code" type="text" placeholder="12345"/>
                </b-field>
            </div>
            <div>
                <meeting-time v-for="(meeting, index) in congregation.meetings" v-model="congregation.meetings[index]" style="margin: 1em;" :key="index"/>
            </div>
        </div>
        <b-button style="margin-top: .5em; margin-bottom: .5em;" native-type="submit" type="is-primary" :disabled="!congregationValid" @click="setupCongregation">Create Congregation</b-button>
    </form>
    
    </div>
</template>
<script>
import MeetingTime from "@/components/MeetingTime";
import firebase from "@/mixins/firebase.mixin.js";
const fb = require("@/firebaseConfig.js");
import congregation from "@/mixins/congregation.mixin.js";
import moment from "moment";
export default {
    components: {
        MeetingTime
    },
    computed: {
        congregationValid(){ 
            let isValid = false;    
            isValid = this.congregation.name != null && this.congregation.meetings.every(meeting=>{
                return meeting.day != null && meeting.time != null
            });
            return isValid;
        }
    },
    data(){
        return {
            congregation:{
                meetings: [{}, {}],
                address: {
                    street: null,
                    city: null,
                    state: null,
                    country: null,
                    zip_code: null,
                },
                name: null,
            },
            autocomplete: null
        }
    },
    methods: {
        initAutocomplete() {
            let element = document.getElementById("autocomplete")
            this.autocomplete = new google.maps.places.Autocomplete(element, {types: ['geocode']});
            this.autocomplete.setFields(['address_component']);
            this.autocomplete.addListener('place_changed', (event)=>{
                let place = this.autocomplete.getPlace();
                let ac = place.address_components
                this.congregation.address = this.getAddress(ac);
                this.fetchCongregationAddress(this.congregation.address).then(response=>{
                    this.congregation.address_id = response;
                });
            });
        },
        getAddress(mapsAddress){
            let address = {
                street: null,
                city: null,
                state: null,
                country: null,
                zip_code: null
            }
            for(let field of mapsAddress){
                if(field.types.includes("street_number")){
                    address.street = `${field.short_name}`;
                }
                if(field.types.includes("route")){
                    address.street = `${address.street} ${field.long_name}`;
                }
                if(field.types.includes("locality")){
                    address.city = field.long_name;
                }
                if(field.types.includes("administrative_area_level_1")){
                    address.state = field.long_name
                }
                if(field.types.includes("country")){
                    address.country = field.long_name
                }
                if(field.types.includes("postal_code")){
                    address.zip_code = field.long_name;
                }
                if(field.types.includes("postal_code_suffix")){
                    address.zip_code = `${address.zip_code}-${field.long_name}`
                }
            }
            return address
        },
        async setupCongregation(){
            let congregation = JSON.parse(JSON.stringify(this.congregation))
            congregation.meeting_times = [];
            for(let meeting of congregation.meetings){
                congregation.meeting_times.push(meeting.meeting_id) ;
            }
            delete congregation.meetings;
            delete congregation.address;
            let congregation_id = await this.createCongregation(congregation);
            fb.auth.createUserWithEmailAndPassword(this.$route.params.signUp.email, this.$route.params.signUp.password).then(user => {
                    this.addUser({name: this.$route.params.signUp.name, email: this.$route.params.signUp.email, is_super_admin: false, is_admin: true, is_publisher: true, congregation_id}, this.$route.params.referral_id);
                    this.$emit('userChange', user)
                    this.$router.push("/");
                }).catch(err => {
                    console.log(err)
                })
        }
    },
    mixins: [firebase, congregation],
    mounted(){
        this.initAutocomplete();
    },
    watch: {
        'congregation.address': {
            handler(newVal){
                // this.findCongregationByAddress(newVal)
            }
        }
    }
}
</script>
