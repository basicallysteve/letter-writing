let functions = require('firebase-functions');

const admin = require("firebase-admin");

let serviceAccount = require("../serviceAccountKey.json");
let {createReferral} = require("./modules/referrals");

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

export const referFriend = functions.https.onCall((referralInfo: any)=>{
    return createReferral(referralInfo.email, referralInfo.user_id);
});

exports.sendReferralEmail = functions.firestore
                                     .document("/referrals/{referralId}")
                                     .onCreate(async (snap: any, context: Object)=>{
                                        let db = admin.firestore();
                                        let mailRef = db.collection("mail").doc();
                                        let userDoc = await db.collection("/users").doc(snap.data().user_id).get();

                                        mailRef.set({
                                            to: snap.data().email,
                                            message: {
                                                subject: "Letter Writing App Referral",
                                                html: `<div>
                                                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.2/css/bulma.min.css">
                                                <div>
                                                    <h1 class="title is-2">Hello!</h1>
                                                    <div style="display: flex; flex-flow: column;">
                                                        <p>You have be referred to join the <a href="https://letter-writing-app.web.app/signup" target="_blank">Letter Writing App</a> by ${userDoc.data().name}. Below you will find your referral code. Please use it within 24 hours otherwise it will be invalid.</p>
                                                        <code>${snap.data().code}</code>
                                                    </div>
                                                </div>
                                                </div>`
                                            }
                                        })
                                     })

exports.createUser = functions.firestore
                              .document("/users/{userId}")
                              .onCreate(async (snap: any, context: Object)=>{
                                const newUser:any = snap.data();

                                let db = admin.firestore();
                                let admins = await db.collection("/users").where("is_admin", "==", true).where("congreagation_id", "==", newUser.congreagation_id).get()
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