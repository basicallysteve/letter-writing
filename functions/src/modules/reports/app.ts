import {ReportBuilder} from "./ReportBuilder"
let path = require("path");
// let moment = require("moment");
// let functions = require("firebase-functions");
let admin = require("firebase-admin");
import serviceAccount from "./serviceAccountkey";
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://letter-writing-app.firebaseio.com",
})

export function streetHistoryReport(history: Array<Object>){
    let pages = Math.ceil(history.length/35)
    for(let i = 0; i < pages; i++){
        let report = new ReportBuilder({
            name: 'sign-out-log',
            addHeader: i == 0,
            reportData: {
                history: history.slice(i*35, (i+1)*35),
            }
        })
        report.toPDF(path.join(__dirname, '..', '..', '..', 'exports', `signout.page_${i+1}.pdf`));
    }    
}

// admin.firestore().collection("territories").get().then((snapshot:any) => {
//     snapshot.forEach(async (doc:any)=>{
       
            // let territory:any = await doc.data();
            // territory._streets = territory._streets ?? [];
            // let sixMonthsAgo = moment().subtract(6, 'months');
            
            // try{
            //     let newHistory = territory._streets.filter((street:any) => {
            //        return street.last_checkout?.toDate ? moment(street.last_checkout.toDate()).isAfter(sixMonthsAgo) : false;
            //     }).map((history:any) => ({
            //         checked_out_by: history.checked_out_by,
            //         last_checkout: history.last_checkout,
            //         returned_at: history.returned_at,
            //         released_at: history.released_at,
            //         territory_id: territory.territory_id,
            //         street_id: history.street_id,
            //     }))
           
            // let batch = admin.firestore().batch();


            // newHistory.forEach((history:any)=>{
            //     var docRef = admin.firestore().collection("analytics/territories/street-history").doc(); //automatically generate unique id
            //     batch.set(docRef, history);
            // })

            // batch.commit();

            // }catch(err){
            //     console.log(err);
            // }
            
                // territory._streets = territory?._streets?.map((street:any) => {
                //     let index = streetsWithStreetIds.findIndex((missingStreetId:any) => missingStreetId.name == street.name);
                //     if(index >= 0){
                //         return streetsWithStreetIds[index];
                //     }
                //     return street;
                // }) ?? []

                // admin.firestore().collection("territories").doc(territory.territory_id).set(territory);
        
           
//     })
// })


// let sixMonthsAgo = moment().subtract(6, 'months');

// let historyData:Array<Object> = []
// admin.firestore().collection("analytics/territories/street-history").where('last_checkout', '>=', sixMonthsAgo.toDate()).get().then((snapshot:any)=>{
//     let length = 0;
//     snapshot.forEach(async (doc:any)=>{
//         let history:any = doc.data();
//         console.log(history);

//         try{
//             history.last_checkout = history?.last_checkout?.toDate();
//             history.returned_at = history?.returned_at?.toDate();
//             history.released_at = history?.released_at?.toDate();
//             let territoryDoc = await admin.firestore().collection("territories").doc(history.territory_id).get();
//             history.territory = territoryDoc.data();
//             history.territory.name = history.territory.name ?? "Territory N/A"
//             history.territory_name = history.territory.name;

//             delete history._streets;
//             if(history.checked_out_by){
//                 let userDoc = await admin.firestore().collection("users").doc(history.checked_out_by).get();
//                 history.checkedOutBy = userDoc.data();
//             }else{
//                 history.checkedOutBy = {
//                     name: "N/A"
//                 }
//             }

            
//             let streetDoc = await admin.firestore().doc(`territories/${history.territory_id}/streets/${history.street_id}`).get();
//             history.street = streetDoc.data();
//             history.street_name = history.street.name ?? "N/A"
//             if(history.last_checkout instanceof Date && history.returned_at instanceof Date){
//                 historyData.push(history)
//             }
//             else{
//                 length++;
//             }
//             if(snapshot.size - length == historyData.length){
//                 historyData.sort((a:any, b:any)=> a.territory_name.localeCompare(b.territory_name))
//                 streetHistoryReport(historyData);
//             }
//         }catch(err){
//             length++;
//         }
//     })
// })

admin.firestore().collection("territories").where("deleted_at", "==", null).get().then((response:any)=>{
    response.forEach((doc:any) => {
        let territory:any = doc.data();

        admin.firestore().collection(`territories/${territory.territory_id}/streets`).get().then(async (streetsResponse:any)=>{
            
            // if(territory._streets?.length != streetsResponse.size){
            //     // for(let street of territory._streets){
            //     //     let streetDoc:any = admin.firestore().collection(`territories/${territory.territory_id}/streets`).doc();
            //     //     street.street_id = streetDoc.id;
                    
            //     //     await streetDoc.set({
            //     //         ...street,
            //     //     })
            //     // }
                
            // }else{
            //     console.log(territory._streets.every((street:any) => street.street_id != null))
            // }
            // console.log(`Territory: ${territory.name}\n _streets size: ${territory._streets?.length} streets size:${streetsResponse.size} `);
        })
        
    })
})