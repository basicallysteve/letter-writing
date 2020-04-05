import firebase from "firebase";
const fb = require('@/firebaseConfig.js')

export default {
    methods: {
        addUser(user){
            let db = firebase.firestore();
            let newUserRef = db.collection("/users").doc();
            newUserRef.set(user);
        },

        fetchUser(email){
            let db = firebase.firestore();
            return db.collection("/users").where(`email`, "==", email).get();
        },


        addTerritory(territory){
            let db = firebase.firestore();
            let newTerritoryRef = db.collection("/territories").doc();
            newTerritoryRef.set(territory);
        },
        async fetchTerritories(){
            let db = firebase.firestore();
            let territories = []
            let territoriesSnapshot = await db.collection("/territories").get();
            territoriesSnapshot.forEach(doc=>{
                let territory = doc.data();
                territory.territory_id = doc.id;
                territories.push(territory)
            })
            return territories
        },
        updateTerritory(territory){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory.territory_id).update(territory);
        },

        updateStreet(territory, oldStreet, street){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory.territory_id).update({
                streets: firebase.firestore.FieldValue.arrayRemove(oldStreet)
            }).then(()=>{
                db.collection("/territories").doc(territory.territory_id).update({
                    streets: firebase.firestore.FieldValue.arrayUnion(street)
                })
            })
        },
        deleteTerritory(territory_id){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory_id).delete();
        },

        downloadStreet(territory, street){
            firebase.storage().ref(`territories/${territory.name}/${street.name}.xlsx`).getDownloadURL().then(url=>{
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
            });
        }
    }
}