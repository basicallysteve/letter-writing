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

function checkInTerritoryWithNoCheckedOutByUser(territory){
    territory.streets.forEach(street=>{
        if(street.checked_out && !street.checked_out_by && !street.returned_at){
            street.checked_out = null;
            street.last_checkout = null;
            street.checked_out_by = null;
        }
    });
    return territory;
}

function addCongregationIDToTerritory(territory){
    territory.congregation_id = "115774";
    return territory;
}

function addIsLetterWritingFlag(territory){
    territory.is_letter_writing = territory.name != "Territory 34";
    return territory;
}
function fix(){
    admin.firestore().collection("/territories").get().then(snapshot=>{
        snapshot.forEach(doc=>{
            let territory = doc.data();
            checkInTerritoryWithNoCheckedOutByUser(territory);
            addCongregationIDToTerritory(territory);
            addIsLetterWritingFlag(territory);

            admin.firestore().collection("/territories").doc(doc.id).update(territory);
        })
    })
}

fix();