<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="signup">Sign Up</router-link> | 
      <router-link to="territories">Territories</router-link>
    </div>
    <router-view @userChange="changeUser" :user="profile"/>
  </div>
</template>
<script>
import firebase from "firebase";
const fb = require('./firebaseConfig.js')
import firebaseMixin from "@/mixins/firebase.mixin.js";

export default {
  data(){
    return {
      currentUser: null,
      profile: null
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
    }
  },
  mixins: [firebaseMixin],
  mounted(){
    this.currentUser = firebase.auth().currentUser
    this.fetchUser(this.currentUser.email).then(querySnap=>{
        let user = null;
        return querySnap.forEach(doc=>{
            this.profile = {...doc.data(), user_id: doc.id};
        })
    });
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

  a {
    font-weight: bold;
    color: #2c3e50;

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
</style>
