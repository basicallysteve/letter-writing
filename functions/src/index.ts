let functions = require('firebase-functions');
const sgMail = require("@sendgrid/mail");

const admin = require("firebase-admin");

let serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    apiKey: "AIzaSyAFHTI9Sc-DjGHz2oo-w5Cvw30bXeSMgxI",
    authDomain: "localhost",
    databaseUrl: "",
    projectId: "letter-writing-app",
    storageBucket: "gs://letter-writing-app.appspot.com",
    messageSenderId: ""
});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


export const deleteUser = functions.https.onCall((userId: string)=>{
    try{
        let db = admin.firestore();
        db.collection("/users").doc(userId).delete();
        admin.auth().deleteUser(userId);
        return {
            status: 200,
            data: userId
        }
    }catch(err){
        return {
            status: 500,
            err
        }
    }
})


exports.emailMessage = functions.https.onCall((req:any)=>{
    console.log(req);
    const { email, message } = req;
    var text = `<div>
        ${message}
    </div>`;
    const msg = {
        to: email,
        from: "no-reply@servantlite.app",
        subject: `Test Message`,
        text: text,
        html: text
    };
    sgMail.setApiKey("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");
    return sgMail.send(msg);

})