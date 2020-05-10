import firebase from "firebase";

export default {
    data(){
        return {
            db: firebase.firestore()
        }
    },
    methods: {
        async fetchAssignmentTypes(queries = []){
            let assignmentTypes = [];
           
            let ref = this.db.collection("/assignment-types");
            for await(let item of queries){
                ref[item.name](...item.params)
            }
            let assignmentTypesSnapshot = await ref.get();
            assignmentTypesSnapshot.forEach(doc=>{
                let type = doc.data();
                type.assignment_type_id = doc.id
                assignmentTypes.push(type);
            })
            return assignmentTypes;
        },

        async fetchAssignmentType(assignment_type_id){
            return this.db.collection("/assignment-types").doc(assignment_type_id).get();
        },
        async fetchAssignments(queries = []){
            let assignments = [];
           
            let ref = this.db.collection("/assignments")
            for await(let item of queries){
                ref[item.name](...item.params);
            }
            let assignmentsSnapShot = await ref.get();
            assignmentsSnapShot.forEach(async (doc)=>{
                let assignment = doc.data();
                assignment.assignment_id = doc.id;
                let snap =  await this.fetchAssignmentType(assignment.assignment_type_id)
                assignment.type = snap.data()
                assignments.push(assignment);
            });

            return assignments;
        },

        createAssignment(assignment){
            let newAssignmentRef = this.db.collection("/assignments").doc();
            return newAssignmentRef.set(assignment);
        },
        fetchAssignment(assignment_id){
            return this.db.collection("/assignments").doc(assignment_id).get();
        },
        updateAssignment(assignment){
            return this.db.collection("/assignments").doc(assignment.assignment_id).update(assignment);
        },
        deleteAssignment(assignment){
            return this.db.collection("/assignments").doc(assignment.assignment_id).delete();
        }

    },
}