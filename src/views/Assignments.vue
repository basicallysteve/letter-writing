<template>
    <div style="width: 75%; margin: auto;">
    <div style="display: flex; flex-flow: row; justify-content: flex-end; margin-bottom: 1em;">
        <b-datepicker v-model="dateRange" editable placeholder="Date Range" range/>
        <b-button tag="router-link" to="/new-assignment" icon-right="plus">
            New Assignment
        </b-button>
    </div>

    <card v-for="assignment in assignments" :key="assignment.assignment_id" footer>
        <template #title>{{assignment.type.name}}</template>
        <template #content>
            <div style="text-align:left">
                <h5 class="title is-5">{{assignment.name}}</h5>
                <h6 class="subtitle is-6">Assignee: {{assignment.assignee}}{{ assignment.assignee_2 ? "| Secondary Assignee: Assignee 2" : ""}}</h6>
                <p class="content">This assignment is to be completed on {{formatDate(assignment.date)}}.</p>
            </div>
        </template>
        <template #footer>
            <b-checkbox-button  class="card-footer-item" v-model="assignment.confirmed" @input="confirmAssignment(assignment)" :disabled="assignment.confirmed">{{assignment.confirmed ? "Confirmed" : "Confirm"}}</b-checkbox-button>
        </template>
    </card>

    </div>
</template>
<script>
import Card from "@/components/Card.vue"
import assignment from "@/mixins/assignments.mixin";
import moment from "moment";
export default {
    components: {
        Card
    },
    computed: {
        hasPermission(){
            return this.user.is_admin
        }
    },
    data(){
        return {
            assignments: [],
            dateRange: []
        }
    },
    methods: {
        confirmAssignment(assignment){
            let confirmedAssignment = JSON.parse(JSON.stringify(assignment));
            delete confirmedAssignment.type;
            this.updateAssignment(confirmedAssignment);
        },
        loadAssignments(){
            let queries = [];
            if(this.hasPermission){

            }else{
                if(this.user.user_id){
                    queries.push({
                        name: "where",
                        params: ["user_ids", "array-contains", [this.user.user_id]]
                    })
                }
                
            }
            this.fetchAssignments(queries).then(response=>{
                this.assignments = response;
            })
        },
        formatDate(date){
            return date.toDate ? date.toDate() : "Please contact the assigner for information"
        }
    },
    mixins: [assignment],
    mounted(){
        this.loadAssignments()
    },
    updated(){
        // this.loadAssignments()
    },
    props: {
        user: {
            type: Object,
            default(){
                return {
                    user_id: null
                }
            }
        }
    },

}
</script>