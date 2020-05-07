<template>
<div  style="width: 75%; margin: auto;">
    <b-field label="Assignment Type">
        <assignment-type-input v-model="assignmentType" />
    </b-field>
    <b-field label="Assignment Name">
        <b-input />
    </b-field>
    <b-field label="Assignee">
        <assignee-input :congregation_id="user.congregation_id" v-model="assignee"/>
    </b-field>
    <b-field label="Secondary Assignee">
        <assignee-input :congregation_id="user.congregation_id" v-model="assignee2" />
    </b-field>
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

    data(){
        return {
            assignmentType: "",
            assignee: "",
            assignee2: ""
        }
    },
    props: {
        user: {
            type: Object,
            default(){
                return {}
            }
        }
    }

}
</script>