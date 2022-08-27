import firebase from "firebase";
import moment from "moment";
const fb = require('@/firebaseConfig.js')

export default {
    methods: {
        addStreets(territoryId, streets = []){
            return new Promise((res, rej)=>{
                let response = streets.map(street => this.newStreet(territoryId, street));

                res(response);
            })
        },
        newStreet(territoryId, street){
            let db = firebase.firestore();
            let newTerritoryRef = db.collection(`/territories/${territoryId}/streets`).doc();
            newTerritoryRef.set(street);
            return newTerritoryRef;
        },
        async fetchStreets(territoryId, queries = []){
            let streets = []

            let ref = territoryId ? this.db.collection(`territories`).doc(`${territoryId}`).collection(`streets`) : this.db.collectionGroup('streets');

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
        onTerritoryUpdate(territory_id = null, cb){
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
        },
        createTerritory(territory){
            let db = firebase.firestore();
            let newTerritoryRef = db.collection("/territories").doc();
            newTerritoryRef.set(territory);
        },
        async fetchTerritories(queries = []){
            let territories = []

            let ref = this.db.collection("/territories");

            for(let query of queries){
                ref = ref[query.name](...query.items)
            }
            let territoriesSnapshot = await ref.where("deleted_at", "==", null).orderBy("name", "asc").get();
            return new Promise(async (res,rej)=>{
                    if(territoriesSnapshot.size == 0){
                        res([]);
                    }
                    territoriesSnapshot.forEach(async (doc)=>{
                    let territory = doc.data();
                    territory.territory_id = doc.id;
                    if(territory.type_ref && territory.type_ref.get){
                        console.log(territory.type_ref.get)
                    let type = await territory.type_ref?.get();
                    territory.type = type.data();
                    }else{
                        territory.type = {}
                    }
                    territories.push(territory)
                    if(territories.length == territoriesSnapshot.size){
                        res(territories)
                    }
                })
            })
        },

        async fetchTerritoryTypes(queries = []){
            let db = firebase.firestore();
            let types = []
            for(let query of queries){
                ref = ref[query.name](...query.items)
            }
            let ref = db.collection("/territory-types");
            let territoryTypes = await ref.where("deleted_at", "==", null).orderBy("name", "asc").get();
            return new Promise((res, rej)=>{
                territoryTypes.forEach(doc=>{
                    let type = doc.data();
                    type.territory_type_id = doc.id;
                    types.push(type)
                    if(types.length == territoryTypes.size){
                        res(types);
                    }
                });
            });
        },

        async fetchTerritoryHistory(queries = []){
            let db = firebase.firestore();
            let history = [];
            for(let query of queries){
                ref = ref[query.name](...query.items)
            }
            let ref =  db.collection("/analytics/territories/street-history");
            let historyData = await ref.get();
            return new Promise((res, rej)=>{
                historyData.forEach((doc)=>{
                    let item = doc.data();
                    item.street?.get().then(response => {
                        item.checked_out_at = item.checked_out_at ? moment(new firebase.firestore.Timestamp(item.checked_out_at.seconds, item.checked_out_at.nanoseconds).toDate()) : null
                        item.returned_at = item.returned_at ? moment(new firebase.firestore.Timestamp(item.returned_at.seconds, item.returned_at.nanoseconds).toDate()) : null
                        history.push(item)
                        if(history.length == historyData.size){
                            res(history);
                        }
                    })
                    // item.returned_at = firebase.toDateitem.returned_at);
                   
                });
            });
        },
        updateTerritory(territory){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory.territory_id).update(territory);
        },
        deleteTerritory(territory_id){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory_id).delete();
        },
        downloadMap(territory){
            let territories = firebase.storage().ref(`territories`)

            let territoryname = territory.name.split(" ");
            territoryname = territoryname.join(" ");
            let bucket =`/${territoryname}/map.pdf`;
            territories.child(bucket).getDownloadURL().then(url=>{
                let a = document.createElement("a");
                let downloadFile = `${territory.name}.pdf`;
                
                a.download = downloadFile;
                a.href = url;     
                a.target =  "_blank";          
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                
               
                document.body.removeChild(a);
            }).catch(err=>{
               console.log(err);
            })
        },
        downloadStreet(territory, street){
            let territories = firebase.storage().ref(`territories`)

            let territoryname = territory.name.split(" ");
            territoryname = territoryname.join(" ");

            let bucket = street.pdf_format ? `/${territoryname}/${street.name}.pdf` : `/${territoryname}/${street.name}.xlsx`
            territories.child(bucket).getDownloadURL().then(url=>{
                let a = document.createElement("a");
                let downloadFile = street.pdf_format ? `${street.name}.pdf` : `${street.name}.xlsx`
                
                a.download = downloadFile;
                a.href = url;               
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                
               
                document.body.removeChild(a);
            }).catch(err=>{
               console.log(err);
            })
        },
        saveFile(file, path){
            let storageBucket = firebase.storage().ref()
            let upload = storageBucket.child(path);
            return upload.put(file);
        },
        deleteFile(path){
            let storageBucket = firebase.storage().ref();
            let remove = storageBucket.child(path);
            return remove.delete()
        }
    }
}