import FirebaseDoc from "./FirebaseDoc";
import House from "./House";
import FireabaseCollection from "./FirebaseCollection";
import FirebaseCollection from './FirebaseCollection';
export default class Street extends FirebaseDoc {
    // houses: FirebaseCollection<House>;
    name: String;
    ref: String;
    constructor(props:any){
        super({...props, collection: `${props.parentDocument}/streets`});
        this.ref = props.ref;
        this.name = props.name;
        // this.houses = new FirebaseCollection<House>(`${this.ref}/houses`);
    }
    get requiredFields(){
        return []
    }
    get valid(){
        return true;
    }
    get firebaseDoc(){
        if(this.valid){
            return {
                name: this.name,
            }
        }
        throw new StreetError(`Street missing houses`);
    }
    create(){
        super.create(this.firebaseDoc)
    }
    addNewHouse(house: House){
        // if(house.valid){
        //     this.houses.push(house)
        // }
    }

}

class StreetError extends Error{
    constructor(message: string){
        super(`Street Error: ${message}`);
    }
}