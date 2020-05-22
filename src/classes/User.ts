import {firestore} from "firebase";
import FirebaseDoc from "./FirebaseDoc";

export default class User extends FirebaseDoc {
    name: string;
    email: string;

    constructor(props){
        super({...props, collection: 'users'})
        this.email = props.email;
        this.name = props.name;
    }
    get fields(){
        return [...this.requiredFields, ]
    }
    get requiredFields(){
        return ["name", "email"]
    }
    get valid(){
        return this.requiredFields.every(field=>{
            return this[field] != null && this[field] != "";
        });
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
}

class UserError extends Error{
    constructor(message){
        super(message)
    }
}