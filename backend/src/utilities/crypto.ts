import * as CryptoJS from "crypto-js";

const SECRET = process.env.ENCRYPTION_KEY || "hiddenbrainspune";

export function encryptResponse(data: any): string {
    return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        SECRET
    ).toString();
}

export function decryptResponse(cipher: string): any {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET);

    return JSON.parse(
        bytes.toString(CryptoJS.enc.Utf8)
    );
}