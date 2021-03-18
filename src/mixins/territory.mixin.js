import firebase from "firebase";
const fb = require('@/firebaseConfig.js')

export default {
    methods: {
        async getStreets(territoryId, queries = []){
            let streets = []

            let ref = this.db.collection(`territories`).doc(`${territoryId}`).collection(`streets`);

            for(let query of queries){
                ref = ref[query.name](...query.items)
            }
            let streetsSnapshot = await ref.where("deleted_at", "==", null).orderBy("name", "asc").get();
            return new Promise(async (res,rej)=>{
                if(streetsSnapshot.size == 0){
                    res([]);
                }
                streetsSnapshot.forEach(async (doc)=>{
                let street = doc.data();
                street.street_id = doc.id;
                streets.push(street)
                if(streets.length == streetsSnapshot.size){
                    res(streets)
                }
            })
         })
        },
        updateStreet(territory_id, street){
            return this.db.collection(`territories/${territory_id}/streets`).doc(street.street_id).update(street);
        },
        onTerritoryUpdate(territory_id, cb){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory_id).onSnapshot(cb);
        },
        
        getStreetHistory(queries = []){
            let db = firebase.firestore();

            let ref = db.collection("analytics/territories/street-history");
            for(let query of queries){
                ref = ref[query.name](...query.items)
            }

            let snapshot = ref.orderBy("created_by", 'asc');

            return new Promise(async (res, rej)=>{
                let history = []
                if(snapshot.size == 0){
                    res([]);
                }else{
                    snapshot.forEach(doc=>{
                        let item = doc.data();
                        item.street_history_id = doc.id;

                        history.push(item);

                        if(history.length == snapshot.size){
                            res(history);
                        }
                    })
                }
            })
        }
    }
}