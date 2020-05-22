import FirebaseDoc from "./FirebaseDoc";
import House from "./House";
export default class Street extends FirebaseDoc {
    houses: Array<House>;
    name: String;
    ref: String;
    constructor(props){
        super(props);
        this.ref = props.ref;
        this.name = props.name;
        this.houses = new Array<House>();
        for(let house of props.houses){
            try{
                this.houses.push(new House(house));
            }catch(err){
                console.error(err);
            }
        }
    }
    get requiredFields(){
        return []
    }
    get valid(){
        return true;
    }
    get firebaseDoc(){
        if(this.valid && this.houses.length > 0){
            return {
                deleted_at: this.deleted_at
            }
        }
        else if(this.houses.length == 0){
            throw new StreetError(`Street missing houses`);
        }else{

        }
    }
    get houseCollection(){
        let houses = [];
        for(let house of this.houses){
            houses.push(house.firebaseDoc)
        };
        return {
            collectionName: `${this.ref}/houses`,
            houses
        }
    };

    addNewHouse(house: House){
        if(house.valid){
            this.houses.push(house)
        }
    }

    delete(){
        this.deleted_at = new Date();
    }
}

class StreetError extends Error{
    constructor(message){
        super(`Street Error: ${message}`);
    }
}