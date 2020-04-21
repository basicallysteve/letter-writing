<template>
    <div style="display: flex; flex-flow: row; justify-content: space-around">
        <b-field horizontal label="Day" style="margin-right: 1em;">
            <b-select v-model="meetingTime.day">
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
            </b-select>
        </b-field>
        <b-field horizontal label="Time">
           <b-timepicker icon="clock" :incrementMinutes="15" v-model="meetingTime.time" @blur="loadMeetingTime" hour-format="12" editable/>
        </b-field>
    </div>
</template>
<script>
import moment from "moment";
import congregationMixin from "@/mixins/congregation.mixin"
export default {
    computed: {
        meetingTime: {
            get(){
                return this.$attrs.value
            },
            set(newVal){
                this.$emit("input", newVal)
            }
        }
    },
    methods: {
        async loadMeetingTime(){
            let time = moment(this.meetingTime.time).format("hh:mm A")
            this.meetingTime.meeting_id = await this.findMeetingTimes(this.meetingTime.day, time);
            if(!this.meetingTime.meeting_id){
                let reference = await this.createNewMeetingTime(this.meetingTime.day, time);
                this.meetingTime.meeting_id = reference;
                console.log("ready!");
            }
        }
    },
    mixins: [congregationMixin]
}
</script>