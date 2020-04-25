<template>
<div style="margin-bottom: 1em;">
    <b-modal :active.sync="refer" has-modal-card>
        <referral-form :user="user.user_id"/>
    </b-modal>
    <div style="display: flex; flex-flow: row; justify-content: space-around">
        <b-field label="Name" style="">
            <b-input v-model="user.name" disabled/>
        </b-field>
        <b-field label="Email Address">
            <b-input v-model="user.email" disabled/>
        </b-field>
    </div>
    <div>
        <b-button @click="referFriend">Invite Friends!</b-button>
    </div>
</div>
</template>
<script>
import ReferralForm from "@/views/ReferralForm";
export default {
    components: {
        ReferralForm  
    },
    data(){
        return {
            refer: false
        }
    },
    methods: {
        referFriend(){
            this.refer = true;
        }
    },
    props:{
        user: {
            type: Object,
            default(){
                return {

                }
            }
        }
    },
}
</script>