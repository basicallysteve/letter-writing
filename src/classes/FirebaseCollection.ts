import {firestore} from "firestore";
import Query from "./Query";
export default class FirebaseCollection<T> {
    collection: firestore.CollectionReference
    constructor(collection: string){
        this.collection = firestore().collection(collection);
    }
   
    query(queries: Array<Query> = []): Promise<Array<T>> {
        let ref = this.collection;
        let arr: Array<T> = [];
        for(let query of queries){
            ref = ref[query.name](...query.items);
        }
        let snapshot = ref.where("deleted_at", "==", null).get()
        return new Promise(async (res, rej)=>{
            if(snapshot.size == 0){
                res([]);
            }
            snapshot.forEach(async (doc: any)=>{
                let t = new T({...doc, reference: doc.ref})
                arr.push(t);

                if(arr.length == snapshot.size){
                    res(arr);
                }
            })
        })
    }
}