import crypto from "crypto";
import { TxSecureRecord } from "./types";
import { v4 as uuidv4 } from "uuid";

const toHex = (buf: Buffer) => buf.toString("hex");
const fromHex = (hex: string) => {
    if (!/^[0-9a-f]+$/i.test(hex)) throw new Error("Invalid hex string");
    return Buffer.from(hex, "hex");
};
const validateLength = (buf: Buffer, expected: number, name: string) => {
    if (buf.length !== expected) throw new Error(`${name} must be ${expected} bytes`);
};

// Lazy-load MASTER_KEY at runtime
function getMK(): Buffer {
    const MK_HEX = process.env.MASTER_KEY;
    if (!MK_HEX) throw new Error("MASTER_KEY is not defined in .env");
    const MK = Buffer.from(MK_HEX, "hex");
    if (MK.length !== 32) throw new Error("MASTER_KEY must be 32 bytes (64 hex chars)");
    return MK;
}

export function encrypt(partyId: string, payload: any): TxSecureRecord {
    const MK = getMK(); // use MK here
    const DEK = crypto.randomBytes(32);

    const payloadStr = JSON.stringify(payload);
    const payloadBuf = Buffer.from(payloadStr, "utf8");
    const payloadNonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", DEK, payloadNonce);
    const payload_ct = Buffer.concat([cipher.update(payloadBuf), cipher.final()]);
    const payload_tag = cipher.getAuthTag();

    validateLength(payloadNonce, 12, "payload_nonce");
    validateLength(payload_tag, 16, "payload_tag");

    const dekWrapNonce = crypto.randomBytes(12);
    const dekCipher = crypto.createCipheriv("aes-256-gcm", MK, dekWrapNonce);
    const dek_wrapped = Buffer.concat([dekCipher.update(DEK), dekCipher.final()]);
    const dek_wrap_tag = dekCipher.getAuthTag();

    validateLength(dekWrapNonce, 12, "dek_wrap_nonce");
    validateLength(dek_wrap_tag, 16, "dek_wrap_tag");

    return {
        id: uuidv4(),
        partyId,
        createdAt: new Date().toISOString(),
        payload_nonce: toHex(payloadNonce),
        payload_ct: toHex(payload_ct),
        payload_tag: toHex(payload_tag),
        dek_wrap_nonce: toHex(dekWrapNonce),
        dek_wrapped: toHex(dek_wrapped),
        dek_wrap_tag: toHex(dek_wrap_tag),
        alg: "AES-256-GCM",
        mk_version: 1,
    };
}

export function decrypt(record: TxSecureRecord): any {
    const MK = getMK(); // use MK here

    const payloadNonce = fromHex(record.payload_nonce);
    const payloadCt = fromHex(record.payload_ct);
    const payloadTag = fromHex(record.payload_tag);

    const dekWrapNonce = fromHex(record.dek_wrap_nonce);
    const dekWrapped = fromHex(record.dek_wrapped);
    const dekWrapTag = fromHex(record.dek_wrap_tag);

    validateLength(payloadNonce, 12, "payload_nonce");
    validateLength(payloadTag, 16, "payload_tag");
    validateLength(dekWrapNonce, 12, "dek_wrap_nonce");
    validateLength(dekWrapTag, 16, "dek_wrap_tag");

    const dekDecipher = crypto.createDecipheriv("aes-256-gcm", MK, dekWrapNonce);
    dekDecipher.setAuthTag(dekWrapTag);
    const DEK = Buffer.concat([dekDecipher.update(dekWrapped), dekDecipher.final()]);

    const decipher = crypto.createDecipheriv("aes-256-gcm", DEK, payloadNonce);
    decipher.setAuthTag(payloadTag);
    const decrypted = Buffer.concat([decipher.update(payloadCt), decipher.final()]);

    return JSON.parse(decrypted.toString("utf8"));
}
