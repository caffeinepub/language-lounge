import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ProficiencyLevel {
    level: string;
    language: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    age?: bigint;
    occupation: string;
    proficiencyLevels: Array<ProficiencyLevel>;
    interests: Array<string>;
    name: string;
    education: string;
    likes: string;
    selfIntroduction: string;
    gender: string;
    profilePicture?: ExternalBlob;
    dislikes: string;
    location: string;
    favoriteTravelDestinations: string;
    hobbies: string;
    primaryLanguage: string;
    relationshipStatus: string;
}
export enum RoomType {
    publicRoom = "publicRoom",
    privateRoom = "privateRoom"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(target: Principal): Promise<void>;
    createRoom(name: string, roomType: RoomType): Promise<bigint>;
    deleteRoom(roomId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRoomMessages(roomId: bigint): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isBlocked(target: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(roomId: bigint, content: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    translateText(text: string, sourceLang: string, targetLang: string): Promise<string>;
}
