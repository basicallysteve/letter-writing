import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home';
import Login from "@/views/Login";

import firebase from "firebase";

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: "/logout",
    redirect: "/login"
  },
  {
    path: '/signup',
    name: 'Sign Up',
    component: () => import("@/views/SignUp")
  },
  {
    path: '/about',
    name: 'About',
    meta: {
      requiresAuth: true
    },
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/territories',
    name: 'Territory',
    meta: {
      requiresAuth: true
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/Territories.vue'),
  },
  {
    path: "/admin",
    name: "Admin",
    meta: {
      requiresAuth: true
    },
    component: ()=> import("@/views/Admin.vue")
  }
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
  const currentUser = firebase.auth().currentUser

  if (requiresAuth && !currentUser) {
      next('/login')
  } else if (requiresAuth && currentUser) {
      next()
  } else {
      next()
  }
})

export default router
