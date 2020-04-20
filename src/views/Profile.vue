<template>
<div>
    <b-modal :active.sync="refer" has-modal-card>
        <referral-form :user="user.user_id"/>
    </b-modal>
    <div style="display: flex; flex-flow: row;">
        <b-field label="Name" style="">
            <b-input v-model="user.name" disabled/>
        </b-field>
        <b-field label="Email Address">
            <b-input v-model="user.email" disabled/>
        </b-field>
    </div>
    <div>
        <b-button @click="referFriend">Refer Friends in another hall!</b-button>
        <b-button>Invite Friends in Your Hall!</b-button>
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