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
        async fetchTerritories(){
            let db = firebase.firestore();
            let territories = []
            let territoriesSnapshot = await db.collection("/territories").orderBy("name", "asc").get();
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
            let streets = territory.streets.filter(territoryStreet=>{
                return street.name != territoryStreet.name
            })
            streets.push(street);
            return db.collection("/territories").doc(territory.territory_id).update({
                streets,
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
                a.setAttribute("download", downloadFile);
                a.setAttribute("href", url);
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
            let db = firebase.firestore();
            let streets = []
            let territoriesSnapshot = await db.collection("/territories").get();
            territoriesSnapshot.forEach(doc=>{
                let territory = doc.data();
                territory.territory_id = doc.id;
                territory.streets.forEach(street=>{
                    if(street.checked_out_by == user_id && street.checked_out){
                        street.territory = territory;
                        streets.push(street);
                    }
                })
            })
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