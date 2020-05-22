import {firestore} from "firebase";
import FirebaseDoc from "./FirebaseDoc";

export default class User extends FirebaseDoc {
    name: string;
    email: string;

    constructor(props: any = {}){
        super({...props, collection: 'users'})
        this.email = props.email;
        this.name = props.name;
    }
    get fields(): Array<string>{
        return [...this.requiredFields, "deleted_at", "is_admin", "is_publisher", "is_territory_servant" ]
    }
    get requiredFields(): Array<string>{
        return ["email", "name"]
    }
    set firebaseDoc(newVal: object){
        for(let field of this.fields){
            this[field] = newVal[field];            
        }
    }
    get firebaseDoc(){
        if(this.valid){
            return {
                name: this.name,
                email: this.email,
                deleted_at: this.deleted_at
            }
        }

        throw new UserError("User missing required fields")
    }

    async getByEmail(email: string){
        let snapshot = await firestore().collection(this.collection).where("email", "==", email).limit(1).get();
        snapshot.forEach(doc=>{
            this.reference = doc.ref;
            let user = doc.data();
            super.get(user)
        })
    }
}

class UserError extends Error{
    constructor(message: string){
        super(message)
    }
}