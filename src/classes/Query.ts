export default class Query {
    name: string;
    items: Array<string>;
    constructor(name: string, items: Array<string>){
        this.name = name;
        this.items = items;
    }
}