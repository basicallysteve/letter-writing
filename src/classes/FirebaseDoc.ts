import SoftDelete from "./SoftDelete";
import {firestore} from "firebase"
import Model from './Model';
export default abstract class FirebaseDoc implements SoftDelete, Model {
    deleted_at: Date;
    reference: firestore.DocumentReference | null;
    collection: string;
    constructor(props: any){
        this.deleted_at = props.deleted_at;
        this.collection = props.collection
        this.reference = null;
       (async()=>{
            this.reference = props.reference ? props.reference : props.ref ? await firestore().collection(this.collection).doc(props.ref) : null;
        })()
    }
    get fields(){
        return ["deleted_at"]
    }

    set firebaseDoc(value: object){
        for(let field of this.fields){
            this[field] = value[field];
        }
    }

    get valid(){
        return true
    }
    get firebaseDoc(): object{
        if(this.valid){
            return {
                deleted_at: this.deleted_at
            }
        }
        throw new Error("Firebase Document missing required fields");
    }
    create() {
        this.reference = firestore().collection(this.collection).doc();
    }
    async get(data: object | null): Promise<object>{
        if(data){
            this.firebaseDoc = {deleted_at: null, ...data}
        }
        else if(this.reference){
            let document = await this.reference.get();
            this.firebaseDoc = {deleted_at: null, ...document.data()};
        }else{
            this.create();
            this.get(null);
        }
        
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