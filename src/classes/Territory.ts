import FirebaseDoc from "./FirebaseDoc";
import {firestore} from "firebase";
import Street from "./Street";
export default class Territory extends FirebaseDoc {
    name: string;
    is_visible: boolean = true;
    territory_id: string;
    type_ref: firestore.DocumentReference;
    congregation_id: string;
    _streets: Array<object> = [];
    streets: any;
    streets: firestore.CollectionReference;
    constructor(props: object = {}){
        super({...props, collection: `/territories`, ref: props.territory_id})
        this.name = props.name;
        this.is_visible = props.is_visible;
        this.territory_id = props.territory_id;
        this.type_ref = props.type_ref;
        this.congregation_id = props.congregation_id;
    }


    get fields(): Array<string>{
        return [...this.requiredFields, "streets", "deleted_at", "type_ref", "territory_id" ]
    }
    get requiredFields(): Array<string>{
        return ["is_visible", "name", "congregation_id"];
    }

    set firebaseDoc(newVal: object){
        for(let field of this.fields){
            field = `${field}`;
            this[field] = newVal[field];            
        }
    }
    get firebaseDoc(){
        let doc = {};
        for(let field of this.fields){
            doc[field] = this[field];
        }
        return doc;
    }

    async getByName(name: string){
        let snapshot = await firestore().collection(this.collection).where("name", "==", name).where("deleted_at", "==", null).limit(1).get();
        snapshot.forEach(doc=>{
            this.reference = doc.ref;
            console.log(this.reference);
            let territory = doc.data();
            super.get(territory);
        })
    }
    addStreet(name: string){
        if(this.firebaseDoc.streets != null){
            super.update({
                streets: firestore.FieldValue.delete()
            })
        }
        let streetReference = this.reference?.collection("streets").doc();
        let street = new Street({
            name,
            reference: streetReference,
            parentDocument: `${this.collection}/${this.reference?.id}`
        })
        street.create();

    }

}