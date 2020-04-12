<template>
    <div style="display: flex; flex-flow: row; justify-content: space-around">
        <b-field horizontal label="Day" style="margin-right: 1em;">
            <b-select v-model="meetingTime.day">
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
            </b-select>
        </b-field>
        <b-field horizontal label="Time">
           <b-timepicker icon="clock" :incrementMinutes="15" v-model="meetingTime.time" editable/>
        </b-field>
    </div>
</template>
<script>
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
    }
}
</script>