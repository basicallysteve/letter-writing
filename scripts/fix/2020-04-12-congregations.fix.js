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

function addAddressOnCongregation(congregation){
    db.collection("/congregation").doc(congregation.congregation_id).update(congregation);
}
function fixCongregationIdOnRelatedModels(model, id, update){
    try{    
        db.collection(`/${model}`).doc(id).update(update);
    }catch(err){
        console.log(model, id, update);

    }
}


let db = admin.firestore();
(async()=>{
   let congregations =  await db.collection("/congregation").get().then(snapshot=>{
            let congregations = [];
            snapshot.forEach(doc=>{
                let congregation = doc.data();
                congregation.congregation_id = doc.id;
                congregations.push(congregation);
            })
            return congregations;
        })
    let northCoram = congregations.find(congregation=>{
        return congregation.name == "North Coram";
    })
    db.collection("/users").get().then(snapshot=>{
        snapshot.forEach(doc=>{
            let user = doc.data();
            user.user_id = doc.id;
            user.congregation_id = northCoram.congregation_id;
            fixCongregationIdOnRelatedModels("users", user.user_id, user);
        });
    });

    db.collection("/territories").get().then(snapshot=>{
        snapshot.forEach(doc=>{
            let territory = doc.data();
            territory.territory_id = doc.id;
            territory.congregation_id = northCoram.congregation_id;
            fixCongregationIdOnRelatedModels("territories", territory.territory_id, territory);
        })
    })


    northCoram.address = {
        street: "4 Pauls Path",
        city:  "Coram",
        state: "New York",
        country: "United States",
        zip_code: "11727-3713"
    }

    addAddressOnCongregation(northCoram);

})()
