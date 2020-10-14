import firebase from "firebase";
const fb = require('@/firebaseConfig.js')

export default {
    data(){
        return {
        }  
    },
    methods: {
        async addUser(user){
            let db = firebase.firestore();

            let congregationSnapshot = await db.collection("/congregation").where("name", "==", "North Coram").get();
            congregationSnapshot.forEach(doc=>{
                user.congregation_id = doc.id;
                user.email = user.email.toLowerCase();
                db.collection("/users").doc().set(user);
            });
        },

        fetchUser(email){
            let db = firebase.firestore();
            return db.collection("/users").where("email", "==", email).get();
        },
        async fetchUsers(){
            let users = [];
            let db = firebase.firestore();

            let usersSnapshot = await db.collection("/users").get();
            usersSnapshot.forEach(doc=>{
                let user = doc.data();
                user.user_id = doc.id
                users.push(user);
            })
            return users;
        },
        updateUser(user){
            let db = firebase.firestore();
            return db.collection("/users").doc(user.user_id).update(user)
        },
        fetchUserById(id){
            let db = firebase.firestore();
            return db.collection("/users").doc(id).get()
        },
        deleteUser(id){
            // let functions = firebase.functions();
            // let callable = functions.httpsCallable("deleteUser");
            // callable(id);
            // let db = firebase.firestore();
            // return db.collection("/users").doc(id).delete();
        },
        onUsersUpdate(cb){
            let db = firebase.firestore();
            return db.collection("/users").onSnapshot(cb);
        },  
        signout(){
            return firebase.auth().signOut()
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
                    if(territory.type_ref){
                    let type = await territory.type_ref.get();
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
        updateTerritory(territory){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory.territory_id).update(territory);
        },

        updateStreet(territory, oldStreet, street, user_ref, add){
            let db = firebase.firestore();
            let streets = territory._streets.filter(territoryStreet=>{
                return street.name != territoryStreet.name
            })
            streets.push(street);
            if(user_ref != null){
                this.fetchUserById(user_ref).then(doc=>{
                    let user = doc.data();
                    if(add){
                        user.num_of_checked_out_streets = user.num_of_checked_out_streets ? user.num_of_checked_out_streets + 1 : 1; 
                    }else{
                        user.num_of_checked_out_streets = user.num_of_checked_out_streets ? user.num_of_checked_out_streets - 1 : 0; 
                    }
                    this.updateUser(user);
                })
            }
            
            return db.collection("/territories").doc(territory.territory_id).update({
                _streets: streets
            })
        },
        deleteTerritory(territory_id){
            let db = firebase.firestore();
            return db.collection("/territories").doc(territory_id).delete();
        },

        downloadStreet(territory, street){
            let territories = firebase.storage().ref(`territories`)

            let territoryname = territory.name.split(" ");
            // territoryname[1] = parseInt(territoryname[1]);
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
        onTerritoryUpdate(cb){
            let db = firebase.firestore();
            return db.collection("/territories").onSnapshot(cb);
        },

        async fetchStreets(user_id){
            let streets = []
            let territories = await this.fetchTerritories();
            for(let territory of territories){
                if(territory._streets != null){
                    territory._streets.forEach(street=>{
                        if(street.checked_out_by == user_id && street.checked_out){
                            street.territory = territory;
                            streets.push(street);
                        }
                    })
                }                
            }
           return streets;
            
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
    },
}