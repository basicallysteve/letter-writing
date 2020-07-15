import {firestore} from "firebase";
import FirebaseDoc from "./FirebaseDoc";

export default class User extends FirebaseDoc {
    name: string;
    email: string;
    is_admin: Boolean;
    is_publisher: Boolean;
    is_territory_servant: Boolean;
    constructor(props: any = {}){
        super({...props, collection: 'users'})
        this.email = props.email;
        this.name = props.name;
        this.is_admin = props.is_admin;
        this.is_publisher = props.is_publisher;
        this.is_territory_servant = props.is_territory_servant;
    }
    get fields(): Array<string>{
        return [...this.requiredFields, "deleted_at", "is_admin", "is_publisher", "is_territory_servant" ]
    }
    get requiredFields(): Array<string>{
        return ["email", "name"]
    }
    set firebaseDoc(newVal: any){
        for(let field of this.fields){
            switch(field){
                case "email":
                    this.email = newVal[field];
                    break;
                case "name":
                    this.name = newVal[field];
                    break;
                case "is_admin":
                    this.is_admin = newVal[field];
                    break;
                case "is_publisher":
                    this.is_publisher = newVal[field];
                    break;
                case "is_territory_servant":
                    this.is_territory_servant = newVal[field];
                    break;
                default: 
                    break;
            }
                   
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