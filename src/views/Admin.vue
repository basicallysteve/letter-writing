<template>
<div style="width: 75%; margin: auto;">
    <h1 class="title is-4">Admin</h1>
    <b-table :data="users" :detailed="$attrs.user.is_admin">
        <template v-slot="props">
            <b-table-column label="User">{{props.row.name}}</b-table-column>
            <b-table-column label="Email">{{props.row.email}}</b-table-column>
            <b-table-column label="Max Number of Streets"><b-input @input="updateUser(props.row)" v-model="props.row.max_number_of_streets" type="number" :min="0" /></b-table-column>
            <b-table-column label="Actions">
                <b-button type="is-danger" :disabled="$attrs.user ? !$attrs.user.is_super_admin : false" @click="deleteUser(props.row.user_id)">Delete User</b-button>
            </b-table-column>
        </template>
        <template slot="detail" slot-scope="props">
            <div>
                <b-checkbox v-model="props.row.is_admin" :disabled="$attrs.user ? !$attrs.user.is_super_admin : false" @input="updatePermission(props.row)">Admin</b-checkbox>
                <b-checkbox v-model="props.row.is_publisher" :disabled="$attrs.user ? !$attrs.user.is_admin : false" @input="updatePermission(props.row)">Publisher</b-checkbox>
                <b-checkbox v-model="props.row.is_territory_servant" :disabled="$attrs.user ? !$attrs.user.is_admin : false" @input="updatePermission(props.row)">Territory Servant</b-checkbox>
            </div>
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