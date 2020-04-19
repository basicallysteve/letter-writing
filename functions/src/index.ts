let functions = require('firebase-functions');

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


// exports.emailMessage = functions.https.onCall((req:any)=>{
//     console.log(req);
//     const { email, message } = req;
//     var text = `<div>
//         ${message}
//     </div>`;
//     const msg = {
//         to: email,
//         from: "no-reply@servantlite.app",
//         subject: `Test Message`,
//         text: text,
//         html: text
//     };
//     sgMail.setApiKey("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");
//     return sgMail.send(msg);

// })


exports.createUser = functions.firestore
                              .document("/users/{userId}")
                              .onCreate(async (snap: any, context: Object)=>{
                                const newUser:any = snap.data();

                                let db = admin.firestore();
                                let admins = await db.collection("/users").where("is_admin", "==", true).get()
                                admins.forEach((doc:any )=>{
                                    let user = doc.data();
                                    let mailRef = db.collection("mail").doc();
                                    mailRef.set({
                                        to: user.email,
                                        message: {
                                            subject: "New User Alert",
                                            text: `${newUser.name} has been added to the Letter Writing App! Please verify that this user is a member of your congregation`,
                                            html: `${newUser.name} has been added to the Letter Writing App! Please verify that this user is a member of your congregation`,
                                        }
                                    })
                                })
                            })


exports.returnedTerritory = functions.firestore
                                     .document("/territories/{territoryId}")
                                     .onUpdate(async (change: any, context: Object)=>{
                                        const oldTerritory = change.before.data() 
                                        const newterritory = change.after.data();
                                        for(let street of newterritory.streets){
                                            let oldStreet = oldTerritory.streets.find((old:any)=>{
                                                return old.name == street.name;
                                            })
                                            if(street.returned_at != oldStreet.returned_at && street.returned_at != null){
                                                let db = admin.firestore();
                                                let territoryServants = await db.collection("/users").where("is_territory_servant", "==", true).get()
                                                territoryServants.forEach((doc:any )=>{
                                                    let user = doc.data();
                                                    let mailRef = db.collection("mail").doc();
                                                    mailRef.set({
                                                        to: user.email,
                                                        message: {
                                                            subject: "Territory Returned Alert",
                                                            text: `${street.checked_out_name} has returned ${street.name}`,
                                                            html: `${street.checked_out_name} has returned ${street.name}`,
                                                        }
                                                    })
                                                })
                                            }
                                        }
                                       
                                     })