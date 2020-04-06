<template>
<div style="width: 75%; margin: auto;">
    <h1 class="title is-4">Admin</h1>
    <b-table :data="users">
        <template v-slot="props">
            <b-table-column label="User">{{props.row.name}}</b-table-column>
            <b-table-column label="Email">{{props.row.email}}</b-table-column>
            <b-table-column label="Privileges">
                <b-checkbox v-model="props.row.is_admin" :disabled="$attrs.user ? !$attrs.user.is_super_admin : false" @input="updatePermission(props.row)">Admin</b-checkbox>
                <b-checkbox v-model="props.row.is_publisher" :disabled="$attrs.user ? !$attrs.user.is_admin : false" @input="updatePermission(props.row)">Publisher</b-checkbox>
            </b-table-column>
            <b-table-column label="Actions">
                <b-button type="is-danger" :disabled="$attrs.user ? !$attrs.user.is_super_admin : false" @click="deleteUser(props.row.user_id)">Delete User</b-button>
            </b-table-column>
        </template>
    </b-table>
</div>
</template>
<script>
import firebaseMixin from "@/mixins/firebase.mixin";
export default {
    beforeDestroy(){
        this.userListener
    },
    data(){
        return {
            users: [],
            userListener: null
        }
    },
    methods: {
        loadUsers(){
            this.fetchUsers().then(users=>{
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
    }
}
</script>