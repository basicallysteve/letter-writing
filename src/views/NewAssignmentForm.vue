<template>
<div  style="width: 75%; margin: auto;">
    <b-field label="Assignment Type" :type="{'is-danger': !validType}">
        <assignment-type-input v-model="assignment.type.name" @select="selectType"/>
    </b-field>
    <b-field label="Assignment Name" :type="{'is-danger': !validName}">
        <b-input v-model="assignment.name" />
    </b-field>
    <div class="columns">
        <div class="column">
            <b-field label="Assignee" :type="{'is-danger': !validAssignee}">
                <assignee-input :congregation_id="user.congregation_id" v-model="assignment.assignee" @select="selectAssigneeEmail"/>
            </b-field>
            <b-field label="Secondary Assignee">
                <assignee-input :congregation_id="user.congregation_id" v-model="assignment.assignee2" @select="selectAssignee2Email" />
            </b-field>
        </div>
        <div class="column">
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

    <b-button :disabled="!validAssignment">Create Assignment</b-button>
</div>
</template>
<script>
import AssigneeInput from "../components/AssigneeInput";
import AssignmentTypeInput from "../components/AssignmentTypeInput";
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
    data(){
        return {
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
                confirmed: false
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
        selectAssigneeEmail(assignee){
            this.assignment.assignee_email = assignee.email;
        },
        selectAssignee2Email(assignee){
            this.assignment.assignee2_email = assignee.email;
        },
        selectType(type){
            this.assignment.type = type;
        },

    }

}
</script>