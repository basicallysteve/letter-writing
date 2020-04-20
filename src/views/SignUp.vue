<template>
    <form @submit.prevent="signUpUser">
        <div style="width: 75%; display: flex; flex-flow: column; margin: auto; margin-bottom: 1em;">
            <b-field label="Name">
                <b-input v-model="signUp.name" type="text" placeholder="John Doe"/>
            </b-field>
            <b-field label="Email">
                <b-input v-model="signUp.email" type="email" placeholder="johndoe@gmail.com"/>
            </b-field>
            <b-field label="Password">
                <b-input v-model="signUp.password" type="password" placeholder="Password"/>
            </b-field>
            <b-field label="Referral Code">
                <b-input v-model="signUp.referral" type="text" placeholder="Referral Code" @blur="validateReferral" />
            </b-field>
        </div>
        <b-button style="margin-top: .5em;" native-type="submit" type="is-primary" v-if="validReferral">Sign Up</b-button>
    </form>
</template>
<script>
const fb = require("@/firebaseConfig.js");
import firebaseMixin from "@/mixins/firebase.mixin.js";
export default {
    computed: {
    },
    data(){
        return {
            signUp: {
                name: null,
                email: null,
                password: null,
                referral: null
            },
            validReferral: false,
            referral_id: null
        }
    },
    methods: {
        signUpUser(){
            fb.auth.createUserWithEmailAndPassword(this.signUp.email, this.signUp.password).then(user => {
                this.addUser({name: this.signUp.name, email: this.signUp.email, is_super_admin: false, is_admin: false, is_publisher: false}, this.referral_id);
                this.$emit('userChange', user)
                this.$router.push("/");
            }).catch(err => {
                console.log(err)
            })
        },
        async validateReferral(){
            let {validation, referral_id} = await this.checkReferral(this.signUp.referral, this.signUp.email)
            this.validReferral = validation;
            if(this.validReferral){
                this.referral_id = referral_id;
            }
        }
    },
    mixins: [firebaseMixin]
}
</script>
