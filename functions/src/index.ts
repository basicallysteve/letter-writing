let functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

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
    const { email, message } = req;
        let text = `<div>
                    ${message}
                    </div>`;
        let sesAccessKey = 'stevaganza@gmail.com';
        let sesSecretKey = 'Jehovah1914@';
        let transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            auth: {
                user: sesAccessKey,
                pass: sesSecretKey
            }
        }));
        const mailOptions = {
            to: email,
            from: "no-reply@servantlite.app",
            text, 
            html: text
        };
        return transporter.sendMail(mailOptions, function(err:Error, info:any){
            if(err){
                return {
                    status: 500,
                    err
                }
            }else{
               return {
                   status: 200,
                   message: "success"
               };
            }
            
        })

})