import UserComment from "./Comment";
import FirebaseDoc from "./FirebaseDoc";
import {firestore} from "firebase";
export default class House extends FirebaseDoc {
    contact: string;
    last_contact: Date;
    number: number;
    ref: string;
    rv_ref: any;
    comments: Array<UserComment>
    constructor(props: any){
        super({...props, collection: `${props.collection}/houses`});
        this.contact = props.contact;
        this.last_contact = props.last_contact;
        this.number = props.number;
        this.ref = props.ref;
        this.rv_ref = props.rv_ref;

        this.comments = new Array<UserComment>();

        for(let comment of props.comments){
            this.comments.push(new UserComment(comment));
        }
    }

    get requiredFields(){
        return ["number", "house_id"]
    }

    get valid(){
        return this.requiredFields.every(field=>{
            return this[field] != null && this[field] != ""
        })
    }
    get firebaseDoc(){
        if(this.valid){
            return {
                contact: this.contact,
                last_contact: this.last_contact,
                number: this.number,
                ref: this.ref,
                rv_ref: this.rv_ref,
                deleted_at: this.deleted_at
            }
        }
       
        throw new HouseError(`Required Fields Missing`)
    }

    set comment(comment){
        this.comments.push(new UserComment(comment));
    }
}

class HouseError extends Error {
    constructor(message){
        super(`House Error: ${message}`);
    }
}