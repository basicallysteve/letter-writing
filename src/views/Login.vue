<template>
    <form class="form" @submit.prevent="login">
        <div>
        <b-field label="Email">
            <b-input v-model.trim="loginForm.email" placeholder="Email" id="email"/>
        </b-field>
        <b-field label="Password">
            <b-input v-model.trim="loginForm.password" placeholder="Password" type="password" id="password"/>
        </b-field>
        </div>

        <b-button style="margin-top: .5em;" native-type="submit" type="is-primary">Login</b-button>
    </form>
</template>
<script>
const fb = require("@/firebaseConfig.js");
export default {
    data(){
        return {
            loginForm: {
                email: null,
                password: null
            }
        }
    },

    methods: {
        login() {
            fb.auth.signInWithEmailAndPassword(this.loginForm.email, this.loginForm.password).then(user => {
                this.$emit(user);
                this.$router.push('/')
            }).catch(err => {
                console.log(err)
            })
        }
    }
}
</script>
<style lang="scss">
    
</style>