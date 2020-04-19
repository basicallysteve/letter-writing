import firebase from "firebase";
export default {
    methods: {
        sendEmail(to, message, from=null){
            let db = firebase.firestore();
            let mailRef = db.collection("mail").doc();
            return mailRef.set({
                to,
                from,
                message
            })
        }
    }
}