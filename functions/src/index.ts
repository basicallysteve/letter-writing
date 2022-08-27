let functions = require('firebase-functions');

const admin = require("firebase-admin");
let CreateOrUpdateStreetHistory = require('./modules/tasks/CreateOrUpdateStreetHistory');
let serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    apiKey: "AIzaSyAFHTI9Sc-DjGHz2oo-w5Cvw30bXeSMgxI",
    authDomain: "localhost",
    databaseUrl: "https://servantlite.firebaseio.com/",
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


exports.deleteUser = functions.https.onCall((userId: string)=>{
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

exports.streetActionListener = functions.firestore.document("/territories/{territoryId}")
                                                  .onUpdate(async (change: any, context: Object)=>{
                                                    let updatedTerritory = change.after.data();
                                                    let originalTerritory = change.before.data();
                                                    let db = admin.firestore();
                                                    for(let street of updatedTerritory._streets){
                                                        let oldStreet = originalTerritory._streets.find((old:any)=>{
                                                            return old.name == street.name;
                                                        })
                                                        if(oldStreet == null){
                                                            let ref = await db.collection(`territories/${updatedTerritory.territory_id}/streets`).add(street)
                                                            street.street_id = ref.id;

                                                            let historyRef = await db.collection("/analytics/territories/street-history").add({
                                                                checked_out_by: street.checked_out_by,
                                                                last_checkout: street.last_checkout,
                                                                returned_at: street.returned_at,
                                                                released_at: street.released_at,
                                                                territory_id: updatedTerritory.territory_id,
                                                                street_id: street.street_id,
                                                            });

                                                            street.history_id = historyRef.id;
                                                        }

                                                        if(!street.history_id){
                                                            let historyRef = await db.collection("/analytics/territories/street-history").add({
                                                                checked_out_by: street.checked_out_by,
                                                                last_checkout: street.last_checkout,
                                                                returned_at: street.returned_at,
                                                                released_at: street.released_at,
                                                                territory_id: updatedTerritory.territory_id,
                                                                street_id: street.street_id,
                                                            });

                                                            street.history_id = historyRef.id;
                                                        }
                                                        if(street.returned_at != oldStreet?.returned_at && street.returned_at != null){
                                                           
                                                            let streetDoc = await db.collection(`territories/${originalTerritory.territory_id}/streets`).doc(street.street_id).get();
                                                            let historyDoc = db.collection("/analytics/territories/street-history").doc(streetDoc.data().history_id);
                                                            historyDoc.update({
                                                                returned_at: street.returned_at
                                                            });
                                                        }

                                                        if(street.last_checkout != oldStreet?.last_checkout && street.last_checkout != null){
                                                            let streetDoc = await db.collection(`territories/${originalTerritory.territory_id}/streets`).doc(street.street_id).get();
                                                            let historyDoc = db.collection("/analytics/territories/street-history").doc(streetDoc.data().history_id);
                                                            historyDoc.update({
                                                                last_checkout: street.last_checkout
                                                            });
                                                        }

                                                        if(street.released_at != oldStreet?.released_at && street.released_at != null){
                                                            let streetDoc = await db.collection(`territories/${originalTerritory.territory_id}/streets`).doc(street.street_id).get();
                                                            let historyDoc = db.collection("/analytics/territories/street-history").doc(streetDoc.data().history_id);
                                                            historyDoc.update({
                                                                released_at: street.released_at
                                                            });
                                                            

                                                            await db.collection(`territories/${originalTerritory.territory_id}/streets`).doc(street.street_id).update({
                                                                history_id: null
                                                            })
                                                        }
                                                    }
                                                })

exports.streetUpdatedListener = functions.firestore
                                     .document("/territories/{territoryId}/streets/${streetId}")
                                     .onUpdate(async (change: any, context: Object)=>{
                                        
                                        let newStreet = change.after.data();
                                        CreateOrUpdateStreetHistory(newStreet, admin.firestore());
                                        const oldTerritory = change.before.data() 
                                        const newterritory = change.after.data();
                                        let db = admin.firestore();

                                        
                                        for(let street of newterritory._streets){
                                            let oldStreet = oldTerritory._streets.find((old:any)=>{
                                                return old.name == street.name;
                                            })
                                            if(street.returned_at != oldStreet.returned_at && street.returned_at != null){
                                                let db = admin.firestore();
                                                let streetDoc = await db.collection(`territories/${oldTerritory.territory_id}/streets`).doc(street.street_id).get();
                                                let historyDoc = db.collection("/analytics/territories/street-history").doc(streetDoc.data().history_id);
                                                historyDoc.update({
                                                    returned_at: street.returned_at
                                                });
                                            }

                                            if(street.last_checkout != oldStreet.last_checkout && street.last_checkout != null){
                                                let streetDoc = await db.collection(`territories/${oldTerritory.territory_id}/streets`).doc(street.street_id).get();
                                                let historyDoc = db.collection("/analytics/territories/street-history").doc(streetDoc.data().history_id);
                                                historyDoc.update({
                                                    last_checkout: street.last_checkout
                                                });
                                            }

                                            if(street.released_at != oldStreet.released_at && street.released_at != null){
                                                let streetDoc = await db.collection(`territories/${oldTerritory.territory_id}/streets`).doc(street.street_id).get();
                                                let historyDoc = db.collection("/analytics/territories/street-history").doc(streetDoc.data().history_id);
                                                historyDoc.update({
                                                    released_at: street.released_at
                                                });
                                            }
                                                
                                                // let territoryServants = await db.collection("/users").where("is_territory_servant", "==", true).get()
                                                // territoryServants.forEach((doc:any )=>{
                                                //     let user = doc.data();
                                                //     let mailRef = db.collection("mail").doc();
                                                //     mailRef.set({
                                                //         to: user.email,
                                                //         message: {
                                                //             subject: "Territory Returned Alert",
                                                //             text: `${street.checked_out_name} has returned ${street.name}`,
                                                //             html: `${street.checked_out_name} has returned ${street.name}`,
                                                //         }
                                                //     })
                                                // })
                                            
                                        }
                                       
                })

exports.setUpDB = functions.https.onCall(()=>{
    admin.database().ref("/").set({
        territories: {},
        streets: {},
        users: {},
        congregations: {},
    })
})

