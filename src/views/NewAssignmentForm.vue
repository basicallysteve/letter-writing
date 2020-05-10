<template>
<div  style="width: 75%; margin: auto;">
    <form @submit.prevent="addAssignment">
    <div class="columns">
        <div class="column">
             <b-field label="Assignment Type" :type="{'is-danger': !validType}">
                <assignment-type-input v-model="assignment.type.name" @select="selectType"/>
            </b-field>
            <b-field label="Assignee" :type="{'is-danger': !validAssignee}">
                <assignee-input :congregation_id="user.congregation_id" v-model="assignment.assignee" @select="selectAssigneeEmail"/>
            </b-field>
            <b-field label="Secondary Assignee">
                <assignee-input :congregation_id="user.congregation_id" v-model="assignment.assignee2" @select="selectAssignee2Email" />
            </b-field>
        </div>
        <div class="column">
             <b-field label="Assignment Name" :type="{'is-danger': !validName}">
                <b-input v-model="assignment.name" />
            </b-field>
            <b-field label="Assignee Email" :type="{'is-danger': !validAssigneeEmail }">
                <b-input type="email" v-model="assignment.assignee_email"/>
            </b-field>
            
            <b-field label="Secondary Assignee Email">
                <b-input type="email" v-model="assignment.assignee2_email"/>
            </b-field>
        </div>
    </div>
    
    
    <b-field label="Date" :type="{'is-danger': !validDate}">
        <b-datepicker v-model="assignment.date" editable />
    </b-field>

    <b-button :disabled="!validAssignment" @click="addAssignment">Create Assignment</b-button>
    </form>
</div>
</template>
<script>
import AssigneeInput from "../components/AssigneeInput";
import AssignmentTypeInput from "../components/AssignmentTypeInput";
import assignment from "../mixins/assignments.mixin";
export default {
    
    components: {
        AssigneeInput,
        AssignmentTypeInput
    },
    computed: {
        validAssignee(){
            return this.assignment.assignee != ''
        },
        validAssigneeEmail(){
            return this.assignment.assignee_email != ''
        },
        validAssignment(){
            return this.validAssignee && this.validAssigneeEmail && this.validName && this.validDate && this.validType
        },
        validDate(){
            return this.assignment.date != null
        },
        validName(){
            return this.assignment.name != null && this.assignment.name != ''
        },
        validType(){
            return this.assignment.type.assignment_type_id != null
        }
    }, 
    created(){
        this.emptyAssignment = JSON.parse(JSON.stringify(this.assignment));
    },
    data(){
        return {
            emptyAssignment: {},
            assignment: {
                name: "",
                type: {
                    name: ""
                },
                assignee: "",
                assignee_email: "",
                assignee2_email: "",
                assignee2: "",
                date: null,
                confirmed: false,
                user_ids: [],
                congregation_id: null,
                assigner_id: null
            },
        }
    },
    props: {
        user: {
            type: Object,
            default(){
                return {}
            }
        }
    },
    methods: {
        addAssignment(){
            let assignment = JSON.parse(JSON.stringify(this.assignment));
            delete assignment.type;
            assignment.assigner_id = this.user.user_id;
            assignment.congregation_id = this.user.congregation_id;
            assignment.date = new Date(assignment.date);
            this.createAssignment(assignment).then(()=>{
                this.$buefy.dialog.alert({
                    title: "Assignment Created",
                    message: "Your assignment has been created. Assignees will receive an email shortly!"
                })
                this.assignment = JSON.parse(JSON.stringify(this.emptyAssignment));
            })
        },
        selectAssigneeEmail(assignee){
            this.assignment.assignee_email = assignee.email;
            this.assignment.user_ids.push(assignee.user_id);
        },
        selectAssignee2Email(assignee){
            this.assignment.assignee2_email = assignee.email;
            this.assignment.user_ids.push(assignee.user_id);
        },
        selectType(type){
            this.assignment.type = type;
            this.assignment.assignment_type_id = type.assignment_type_id;
        },

    },
    mixins: [assignment]

}
</script>