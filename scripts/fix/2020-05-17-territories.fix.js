let admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  apiKey: "AIzaSyAFHTI9Sc-DjGHz2oo-w5Cvw30bXeSMgxI",
    authDomain: "localhost",
    databaseUrl: "",
    projectId: "letter-writing-app",
    storageBucket: "gs://letter-writing-app.appspot.com",
    messageSenderId: ""
});


function deletedAtfix(){
    admin.firestore().collection("/territories").where("is_letter_writing", "==", true).get().then(snapshot=>{
        snapshot.forEach(doc=>{
            let territory = doc.data();
            if(territory.streets != null){
                if(territory.streets.every(street=>{
                    return street.checked_out == false || street.returned_at == null
                })){
                    territory.deleted_at = new Date();
                    admin.firestore().collection("/territories").doc(doc.id).update(territory);
                }
            }
            
        })
    })
}

function territoryVisibleDefault(){
    admin.firestore().collection("/territories").where('deleted_at', '==', null).get().then(snapshot=>{
        snapshot.forEach(doc=>{
            let territory = doc.data();
            territory.is_visible = true;
            admin.firestore().collection("/territories").doc(doc.id).update(territory);
        })
    })
}

territoryVisibleDefault();