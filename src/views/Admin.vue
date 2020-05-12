<template>
<div style="width: 75%; margin: auto;">
    <b-modal :active.sync="assignmentViewer" has-modal-card>
        <assignment-viewer :user="userViewed" />
    </b-modal>
    <h1 class="title is-4">Admin</h1>
    <b-table :data="users" :detailed="$attrs.user.is_admin" :per-page="25" paginated>
        <template v-slot="props">
            <b-table-column field="name" label="User" sortable>{{props.row.name}}</b-table-column>
            <b-table-column field="email" label="Email" sortable>{{props.row.email}}</b-table-column>
            <b-table-column label="Actions">
                <b-button @click="viewAssignmentsHandled(props.row)" class="m-r-16">View Handled Assignments</b-button>
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
import AssignmentViewer from "@/components/AssignmentViewer";
export default {
    beforeDestroy(){
        this.userListener
    },
    components: {
        AssignmentViewer
    },
    data(){
        return {
            users: [],
            userListener: null,
            assignmentViewer: false,
            userViewed: null
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
        },
        viewAssignmentsHandled(user){
            this.assignmentViewer = true;
            this.userViewed = user;
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