<template>
    <form @submit.prevent="signUpUser">
        <div style="width: 75%; display: flex; flex-flow: column; margin: auto;">
            <b-field label="Name">
                <b-input v-model="signUp.name" type="text" placeholder="John Doe"/>
            </b-field>
            <b-field label="Email">
                <b-input v-model="signUp.email" type="email" placeholder="johndoe@gmail.com"/>
            </b-field>
            <b-field label="Password">
                <b-input v-model="signUp.password" type="password" placeholder="Password"/>
            </b-field>
        </div>
        <b-button style="margin-top: .5em;" native-type="submit" type="is-primary">Sign Up</b-button>
    </form>
</template>
<script>
const fb = require("@/firebaseConfig.js");
import firebaseMixin from "@/mixins/firebase.mixin.js";
export default {
    data(){
        return {
            signUp: {
                name: null,
                email: null,
                password: null
            }
        }
    },
    methods: {
        signUpUser(){
            fb.auth.createUserWithEmailAndPassword(this.signUp.email, this.signUp.password).then(user => {
                this.addUser({name: this.signUp.name, email: this.signUp.email, is_super_admin: false, is_admin: false, is_publisher: false});
                this.$emit('userChange', user)
            }).catch(err => {
                console.log(err)
            })
        }
    },
    mixins: [firebaseMixin]
}
</script>
