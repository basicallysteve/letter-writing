const admin = require("firebase-admin");
const cc = require("coupon-code");

function createReferral(email: string, user_id: string){
    let code = cc.generate();
    let referral = {
        email, 
        user_id,
        code,
        used: false,
        created_at: new Date()
    }
    console.log(referral);
    let db = admin.firestore();
    let newReferral = db.collection("/referrals").doc();
    console.log(newReferral);
    return newReferral.set(referral);
}

function useReferral(code: string){

}

module.exports = {
    createReferral,
    useReferral
}