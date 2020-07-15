<template>
  <div id="app">
    <b-navbar id="nav">
      <template slot="start">
        <b-navbar-item>
          <router-link to="/">Home</router-link>
        </b-navbar-item>
        <b-navbar-item>
          <router-link to="about">About</router-link>
        </b-navbar-item>
        <b-navbar-item>
          <router-link to="territory-search">Territories</router-link>
        </b-navbar-item>
        <b-navbar-item>
          <router-link to="admin" v-if="user">Admin</router-link>
        </b-navbar-item>
      </template>
      <template #end>
         <b-navbar-item v-if="currentUser == null">
           <router-link to="login">Login</router-link></b-navbar-item>
        <b-navbar-item v-else>
          <a class="router-link" @click="signOut">Logout</a>
        </b-navbar-item>
        <b-navbar-item>
          <router-link to="signup">Sign Up</router-link>
        </b-navbar-item>
      </template>
    </b-navbar>
    <router-view @userChange="changeUser" :user="user"/>
    <div><footing /></div>
  </div>
</template>
<script>
import firebase from "firebase";
import Footer from "./components/Footer";
const fb = require('./firebaseConfig.js')
import firebaseMixin from "@/mixins/firebase.mixin.js";
import EventBus from "./event-bus";
import classes from "./classes/index";
var {User, Territory} = classes;
export default {
  components: {
    'footing': Footer
  },
  data(){
    return {
      currentUser: null,
      profile: {
        is_publisher: false
      },
      user: {}
    }
  },

  methods: {
    changeUser(user){
      this.currentUser = user;
      this.fetchUser(this.currentUser.email).then(querySnap=>{
        return querySnap.forEach(doc=>{
            this.profile = {...doc.data(), user_id: doc.id};
        })
      });
    },
    signOut(){
      this.signout().then(()=>{
        this.currentUser = null;
        this.profile = null;
        this.$router.push("/logout");
      })
    }
  },
  mixins: [firebaseMixin],
  mounted(){
    this.currentUser = firebase.auth().currentUser
    EventBus.$on("updateFound", ()=>{
      this.$buefy.toast.open({
        message: "There's been an update! Reload your app to receive the latest changes!",
        duration: 5000,
      });
    })
    if(this.currentUser){
      
      this.fetchUser(this.currentUser.email).then(querySnap=>{
          querySnap.forEach(doc=>{
              let user = new User()
              user.getByEmail(this.currentUser.email);
              this.user = user;
          })
      }).finally(()=>{
      })
    }
  },

}
  
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  div {
    
  }
  a {
    font-weight: bold;
    color: #2c3e50;
    margin-right: .5em;
    margin-left: .5em;
    &.router-link-exact-active {
      color: #42b983;
    }
  }

  .form{
      display: flex;
      flex-flow: column;
      align-items: center;
      button{
          margin-top: .5em;
      }
  }
}

.flex-row{
  display: flex;
   flex-flow: row;
}
</style>
