import axios from "axios";
const URL = "https://us-central1-letter-writing-app.cloudfunctions.net";
axios.defaults.headers.common.origin = URL;
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
import firebase from "firebase";
export default {
    methods: {
        sendEmail(email, message){
            let functions = firebase.functions();
            let callable = functions.httpsCallable("emailMessage");
            return callable({email, message});
        }
    }
}