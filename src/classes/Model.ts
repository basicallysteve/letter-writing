export default interface Model {
    firebaseDoc: object;
    valid: Boolean;
    requiredFields: Array<string>;
    fields: Array<string>
}