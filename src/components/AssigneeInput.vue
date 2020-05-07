<template>
    <b-autocomplete v-model="value" :data="filteredUsers" field="name" open-on-focus></b-autocomplete>
</template>
<script>
import firebase from "../mixins/firebase.mixin";
export default {
    computed: {
        filteredUsers(){
            return this.users.filter(user=>{
                return user.name.toLowerCase().includes(this.value.toLowerCase());
            });
        },
        value: {
            get(){
                return this.$attrs.value;
            },
            set(newVal){
                this.$emit("input", newVal);
            }
        }
    },
    data(){
        return {
            users: [],
            nameFilter: {
                name: "where",
            }
        }
    },
    methods: {
        async loadUsers(){
            let queries = [
                {
                    name: "where",
                    params: ["congregation_id", "==", this.congregation_id]
                }
            ]
            this.users = await this.fetchUsers(queries)
        }
    },
    mixins: [firebase],
    mounted(){
    },
    props: {
        congregation_id: {
            type: [String],
            default: null
        }
    },
    watch: {
        congregation_id: {
            handler(){
                this.loadUsers()
            }
        },
    }
    
}

</script>

