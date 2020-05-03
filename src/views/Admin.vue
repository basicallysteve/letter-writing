<template>
<div style="width: 75%; margin: auto;">
    <h1 class="title is-4">Admin</h1>
    <profile :user="user"/>

    <hr />
    <b-table :data="users" :detailed="user.is_admin">
        <template v-slot="props">
            <b-table-column label="User">{{props.row.name}}</b-table-column>
            <b-table-column label="Email">{{props.row.email}}</b-table-column>
            <b-table-column label="Actions">
                <b-button :disabled="user ? !user.is_admin : false" @click="moveHalls(props.row.user_id)" style="margin-right: .5em;" v-if="false">Move Halls</b-button>
                <b-button type="is-danger" :disabled="user ? !user.is_super_admin : false" @click="deleteUser(props.row.user_id)">Delete User</b-button>
            </b-table-column>
        </template>
        <template slot="detail" slot-scope="props">
            <div>
                <b-checkbox v-model="props.row.is_admin" :disabled="user ? !user.is_super_admin : false" @input="updatePermission(props.row)">Admin</b-checkbox>
                <b-checkbox v-model="props.row.is_publisher" :disabled="user ? !user.is_admin : false" @input="updatePermission(props.row)">Publisher</b-checkbox>
                <b-checkbox v-model="props.row.is_territory_servant" :disabled="user ? !user.is_admin : false" @input="updatePermission(props.row)">Territory Servant</b-checkbox>
            </div>
        </template>
    </b-table>
</div>
</template>
<script>
import firebaseMixin from "@/mixins/firebase.mixin";
import Profile from  "@/views/Profile";
export default {
    beforeDestroy(){
        this.userListener
    },
    components: {
        Profile
    },
    data(){
        return {
            users: [],
            userListener: null
        }
    },
    methods: {
        moveHalls(userId){

        },
        loadUsers(){
            this.fetchUsers(this.user.congregation_id).then(users=>{
                this.users = users;
            })
        },
        updatePermission(user){
            this.updateUser(user).then(()=>{
                this.loadUsers()
            })
        }
    },
    mixins: [firebaseMixin],
    mounted(){
        this.loadUsers();

        this.userListener = this.onUsersUpdate(()=>{
           this.loadUsers();
        })
    },
    props: {
        user: {
            type: Object,
            default(){
                return {

                }
            }
        }
    }
}
</script>