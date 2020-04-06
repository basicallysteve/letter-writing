<template>
    <form class="form" @submit.prevent="login">
        <div style="width: 75%; margin: auto;">
        <b-field label="Email" :type="{'is-danger': err.code == 'auth/user-not-found'}" :message="emailErrorMessage">
            <b-input v-model.trim="loginForm.email" placeholder="Email" id="email"/>
        </b-field>
        <b-field label="Password" :type="{'is-danger': err.code == 'auth/wrong-password'}" :message="passwordErrorMessage">
            <b-input v-model.trim="loginForm.password" placeholder="Password" type="password" id="password"/>
        </b-field>
        </div>
        <a v-if="passwordErrorMessage" to="reset-passsword" @click="resetPassword">Reset Password</a>
        <b-button style="margin-top: .5em;" native-type="submit" type="is-primary">Login</b-button>
    </form>
</template>
<script>
const fb = require("@/firebaseConfig.js");
export default {
    computed: {
        emailErrorMessage(){
            if(this.err.code == 'auth/user-not-found'){
                return this.err.message;
            }
            return null;
        },
        passwordErrorMessage(){
            if(this.err.code == 'auth/wrong-password'){
                return this.err.message
            }
            return null;
        }
    },
    data(){
        return {
            loginForm: {
                email: null,
                password: null
            },
            err: {
                code: null
            }
        }
    },

    methods: {
        login() {
            fb.auth.signInWithEmailAndPassword(this.loginForm.email, this.loginForm.password).then(user => {
                this.err = {
                    code: null
                }
                this.$emit("userChange", user);
                this.$router.push('/')
            }).catch(err => {
                this.err = err
            })
        },
        resetPassword(){
            fb.auth.sendPasswordResetEmail(this.loginForm.email).then(() => {
                this.$buefy.snackbar.open({
                    duration: 5000,
                    message: `An email was sent to ${this.loginForm.email} to reset your password`,
                    type: 'is-success',
                })
            }).catch(err => {
                console.log(err)
            })
        }
    },
    mounted(){
       
    }
}
</script>
<style lang="scss">
    .form{
      display: flex;
      flex-flow: column;
      align-items: center;
      button{
          margin-top: .5em;
      }
  }

  a {
      font-weight: bold;
      color: red;
      margin-right: .5em;
      margin-left: .5em;
  }
</style>