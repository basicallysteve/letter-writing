import firebase from "firebase";

export default {
    data(){
        return {
            db: firebase.firestore()
        }
    },
    methods: {
        async fetchAssignmentTypes(queries = [],user_id){
            let assignmentTypes = [];
            let availableAssignmentTypes = [];
            if(user_id){
                availableAssignmentTypes = await this.usersAvailableAssignmentTypes(user_id);
            }
            let ref = this.db.collection("/assignment-types");
            for await(let item of queries){
                ref[item.name](...item.params)
            }
            let assignmentTypesSnapshot = await ref.get();
            assignmentTypesSnapshot.forEach(doc=>{
                if(availableAssignmentTypes.length > 0){
                    for(let availableType of availableAssignmentTypes){
                        if(doc.id == availableType.assignment_type_id){
                            let type = doc.data();
                            type.assignment_type_id = doc.id
                            assignmentTypes.push(type);
                        }
                    }
                }else{
                    let type = doc.data();
                    type.assignment_type_id = doc.id
                    assignmentTypes.push(type);
                }
                
            })
            return assignmentTypes;
        },

        async fetchAssignmentType(assignment_type_id){
            return this.db.collection("/assignment-types").doc(assignment_type_id).get();
        },
        fetchAssignments(queries = []){
            return new Promise(async (res, rej)=>{
                let assignments = [];
           
            let ref = this.db.collection("/assignments")
            for await(let item of queries){
                ref = ref[item.name](...item.params)
            }
            let assignmentsSnapShot = await ref.get();
            if(assignmentsSnapShot.size == 0){
                res([])
            }
            assignmentsSnapShot.forEach(async (doc)=>{                
                let assignment = doc.data();
                assignment.assignment_id = doc.id;
                let snap =  await this.fetchAssignmentType(assignment.assignment_type_id)
                assignment.type = snap.data()
                assignments.push(assignment);
                if(assignments.length == assignmentsSnapShot.size){
                    res(assignments);
                }
            });

        })
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
        },

        userGivesAssignment(user_id, assignment_type_id){
            let ref = this.db.collection("/user-gives-assignments").doc();
            return ref.set({user_id, assignment_type_id});
        },

        async usersAvailableAssignmentTypes(user_id){
            let assignmentTypes = [];
           
            let ref = this.db.collection("/user-gives-assignments").where("user_id", "==", user_id);
            let assignmentsSnapShot = await ref.get();
            assignmentsSnapShot.forEach(async (doc)=>{
                let assignmentType = doc.data();
                assignmentTypes.push(doc.data());
            });

            return assignmentTypes;
        }
    },
}