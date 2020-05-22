export default interface SoftDelete {
    deleted_at: Date;
    delete(): void;
}