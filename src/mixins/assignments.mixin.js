import firebase from "firebase";

export default {
    methods: {
        async fetchAssignmentTypes(queries = []){
            let assignmentTypes = [];
            let db = firebase.firestore();
            let ref = db.collection("/assignment-types");
            for await(let item of queries){
                console.log(item);
                ref[item.name](...item.params)
            }
            let assignmentTypesSnapshot = await ref.get();
            assignmentTypesSnapshot.forEach(doc=>{
                let type = doc.data();
                type.assignment_type_id = doc.id
                assignmentTypes.push(type);
            })
            return assignmentTypes;
        }
    }
}