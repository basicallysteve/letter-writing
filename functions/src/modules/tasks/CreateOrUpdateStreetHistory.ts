async function createOrUpdateStreetHistory(street: any, db: any){
    let historyDoc = street.history_id ? db.collection("/analytics/territories/street-history").doc() : db.collection("/analytics/territories/street-history").doc(street.history_id);
    let history = street.history_id ? await historyDoc.get().data() : {} 
    
    let response:object = {
        'last_checkout': null,
        'returned_at': null,
        'released_at': null
    };
    for(let field in street){
        if(history[field] != street[field] && field != 'history_id'){
            response = {
                ...response,
                [field]: street[field]
            }
        }
    }9
    historyDoc.update(response);

    if(street.released_at){
        let streetDoc = db.collection(`/territories/${street.territory_id}/streets`).doc(street.street_id);
        streetDoc.update({
            history_id: historyDoc.id
        });
    }
}

module.exports = createOrUpdateStreetHistory;