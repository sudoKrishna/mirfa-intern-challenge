import { TxSecureRecord } from "./types";
export declare function encrypt(partyId: string, payload: any): TxSecureRecord;
export declare function decrypt(record: TxSecureRecord): any;
