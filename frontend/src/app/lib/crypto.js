import CryptoJS from "crypto-js";

const SECRET = process.env.CRYPTO_SECRET || 'hiddenbrainspune';

export function decryptResponse(cipher) {
    const bytes = CryptoJS.AES.decrypt(
        cipher,
        SECRET
    );

    return JSON.parse(
        bytes.toString(CryptoJS.enc.Utf8)
    );
}