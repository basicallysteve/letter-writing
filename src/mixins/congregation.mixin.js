import firebase from "firebase";
import moment from "moment";
export default {
    data(){
        return {
            db: firebase.firestore()
        }
    },
    methods: {
        async findMeetingTimes(day, time){
            let meetingTimeId;
            let snapshot = await this.db.collection("/congregation-meeting-times").where("day", "==", day)
                                                             .where("time", "==", time)
                                                             .limit(1)
                                                             .get()
            snapshot.forEach(meetingTimeSnap=>{
                meetingTimeId = meetingTimeSnap.id;
            })
            return meetingTimeId;                              
        },
        createNewMeetingTime(day, time){
            let ref = this.db.collection("/congregation-meeting-times").doc();
            ref.set({
                day,
                time
            });
            return ref.id;
        },
        async fetchCongregationAddress(address){
            let db = firebase.firestore();
            let snapshot = await db.collection("/congregation-addresses").where("street", "==", address.street).where("city", "==", address.city).where("state", "==", address.state).where("country", "==", address.country).where("zip_code", "==", address.zip_code).limit(1).get();
            let addressId;
            snapshot.forEach(addressSnapshot=>{
                addressId = addressSnapshot.id;
            })
            return addressId;
        },
        createCongregation(congregation){
            let ref = this.db.collection("/congregation").doc();
            congregation.congregation_id = ref.id;
            ref.set(congregation);
        }
    }
}