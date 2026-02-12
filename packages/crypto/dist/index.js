"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const toHex = (buf) => buf.toString("hex");
const fromHex = (hex) => {
    if (!/^[0-9a-f]+$/i.test(hex))
        throw new Error("Invalid hex string");
    return Buffer.from(hex, "hex");
};
const validateLength = (buf, expected, name) => {
    if (buf.length !== expected)
        throw new Error(`${name} must be ${expected} bytes`);
};
// Lazy-load MASTER_KEY at runtime
function getMK() {
    const MK_HEX = process.env.MASTER_KEY;
    if (!MK_HEX)
        throw new Error("MASTER_KEY is not defined in .env");
    const MK = Buffer.from(MK_HEX, "hex");
    if (MK.length !== 32)
        throw new Error("MASTER_KEY must be 32 bytes (64 hex chars)");
    return MK;
}
function encrypt(partyId, payload) {
    const MK = getMK(); // use MK here
    const DEK = crypto_1.default.randomBytes(32);
    const payloadStr = JSON.stringify(payload);
    const payloadBuf = Buffer.from(payloadStr, "utf8");
    const payloadNonce = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", DEK, payloadNonce);
    const payload_ct = Buffer.concat([cipher.update(payloadBuf), cipher.final()]);
    const payload_tag = cipher.getAuthTag();
    validateLength(payloadNonce, 12, "payload_nonce");
    validateLength(payload_tag, 16, "payload_tag");
    const dekWrapNonce = crypto_1.default.randomBytes(12);
    const dekCipher = crypto_1.default.createCipheriv("aes-256-gcm", MK, dekWrapNonce);
    const dek_wrapped = Buffer.concat([dekCipher.update(DEK), dekCipher.final()]);
    const dek_wrap_tag = dekCipher.getAuthTag();
    validateLength(dekWrapNonce, 12, "dek_wrap_nonce");
    validateLength(dek_wrap_tag, 16, "dek_wrap_tag");
    return {
        id: (0, uuid_1.v4)(),
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
function decrypt(record) {
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
    const dekDecipher = crypto_1.default.createDecipheriv("aes-256-gcm", MK, dekWrapNonce);
    dekDecipher.setAuthTag(dekWrapTag);
    const DEK = Buffer.concat([dekDecipher.update(dekWrapped), dekDecipher.final()]);
    const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", DEK, payloadNonce);
    decipher.setAuthTag(payloadTag);
    const decrypted = Buffer.concat([decipher.update(payloadCt), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
}
