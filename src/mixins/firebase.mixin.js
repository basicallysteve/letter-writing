import firebase from "firebase";
import moment from "moment";
const fb = require('@/firebaseConfig.js')

export default {
    methods: {
        async addUser(user, referral_id){
            let db = firebase.firestore();
            let referralResponse =  await this.fetchReferral(referral_id);
            let referral = referralResponse.data();
            let friend = await this.fetchUserById(referral.user_id);
            user.congregation_id = friend.congregation_id;
            db.collection("/users").doc().set(user);
            this.useReferral(referral_id, referral);
        },

        fetchUser(email){
            let db = firebase.firestore();
            return db.collection("/users").where("email", "==", email).get();
        },
        async fetchUsers(congregation_id){
            let users = [];
            let db = firebase.firestore();

            let usersSnapshot = await db.collection("/users").where("congregation_id", "==", congregation_id).get();
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
        async fetchTerritories(congregation_id){
            let db = firebase.firestore();
            let territories = []
            console.log(congregation_id);
            let territoriesSnapshot = await db.collection("/territories").where("congregation_id", "==", congregation_id).orderBy("name", "asc").get();
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
        },


        findCongregationByAddress(address){
            let db = firebase.firestore();
            let snapshot = db.collection("/congregations").where("address.street", "==", address.street).where("address.city", "==", address.city).where("address.state", "==", address.state).where("address.country", "==", address.country).where("address.zip_code", "==", address.zip_code).get();
            snapshot.then(response=>{
                console.log(response.docs);
            })
        },
        referFriend(email, user_id){
            let functions = firebase.functions();
            let callable = functions.httpsCallable("referFriend");
            callable({email, user_id});
        },
        fetchReferral(id){
            let db = firebase.firestore();
            return db.collection("/referrals").doc(id).get();
        },
        async checkReferral(code, email){
            let db = firebase.firestore();
            let today = moment(Date.now());
            let snapshot = await db.collection("/referrals").where("code", "==", code)
                                                      .where("email", "==", email)
                                                      .where("used", "==", false)
                                                      .limit(1).get();
            if(snapshot.docs.length == 1){
                let created_at_date = moment(snapshot.docs[0].data().created_at.toDate());
                let difference = today.diff(created_at_date, "hours");
                let userDoc = await this.fetchUserById(snapshot.docs[0].data().user_id);
                let user = userDoc.data()
                return {validation: difference < 23, referral_id: snapshot.docs[0].id, default_congregation_id: user.congregation_id, from_admin: user.is_admin};
            }
            return {validation: false, referral_id: null};
        },
        useReferral(referral_id, referral){
            let db = firebase.firestore();
            referral.used = true;
            db.collection("/referrals").doc(referral_id).update(referral);
        }
    },


    
}