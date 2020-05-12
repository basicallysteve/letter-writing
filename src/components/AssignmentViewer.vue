<template>
     <form>
        <div class="modal-card" id="import-window">
            <header class="modal-card-head">
                <p class="modal-card-title">Handles Assignments</p>
            </header>
            <section class="modal-card-body">
               <b-checkbox v-for="type in assignmentTypes" :key="type.assignment_type_id" v-model="type.is_given" @input="handleAssignment(type)">{{type.name}}</b-checkbox>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$parent.close()">Close</button>
            </footer>
        </div>
    </form>
</template>
<script>
import assignment from "@/mixins/assignments.mixin"
export default {
    data(){
        return {
            isLoading: false,
            assignmentTypes: []
        }
    },
    methods: {
        handleAssignment(type){
            this.userGivesAssignment(this.user.user_id, type.assignment_type_id)
        },
        loadUsersAssignmentTypes(){
            this.usersAvailableAssignmentTypes(this.user.user_id).then(response=>{
                // if(response.length  == 1){
                    for(let type of this.assignmentTypes){
                        let userGivesType = response.findIndex(item=>{
                            return item.assignment_type_id == type.assignment_type_id;
                        })

                        type.is_given = userGivesType != -1
                    }
                // }
            })
        },
        loadAssignmentTypes(){
            this.fetchAssignmentTypes().then(response=>{
                for(let type of response){
                    type.is_given = false
                    this.assignmentTypes.push(type);
                }
                // this.assignmentTypes = response;
            }).then(()=>{
                this.loadUsersAssignmentTypes();

            })
        },
    },
    mixins: [assignment],
    mounted(){
        this.loadAssignmentTypes();
    },
    props: {
        user: {
            type: Object,
            data(){
                return {
                    user_id: null
                }
            }
        }
    }
}
</script>