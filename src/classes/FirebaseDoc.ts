import SoftDelete from "./SoftDelete";
import {firestore} from "firebase"
export default class FirebaseDoc implements SoftDelete {
    deleted_at: Date;
    reference: firestore.DocumentReference;
    collection: string;
    constructor(props){
        this.deleted_at = props.deleted_at;
        this.collection = props.collection
       (async()=>{
            this.reference = props.reference ? props.reference : props.ref ? await firestore().collection(this.collection).doc(props.ref) : null;
        })()
    }
    get fields(){
        return [...this.requiredFields, "deleted_at"]
    }
    get requiredFields(){
        return []
    }
    set firebaseDoc(value){
        for(let field of this.fields){
            this[field] = value[field];
        }
    }

    get valid(){
        return true
    }
    get firebaseDoc(){
        if(this.valid){
            return {
                deleted_at: this.deleted_at
            }
        }
    }
    create() {
        this.reference = firestore().collection(this.collection).doc();
    }
    async get(): Promise<Object>{
        let document = await this.reference.get();
        this.firebaseDoc = {deleted_at: null, ...document.data()};
        return this.firebaseDoc;
    }

    update(){
        this.reference.update(this.firebaseDoc);
    }

    delete(): void{
        this.deleted_at = new Date();
        this.reference.update(this.firebaseDoc);
    }
}