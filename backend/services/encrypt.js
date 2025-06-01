// // // utils/encryption.js
// // const crypto = require("crypto");
// // const algorithm = "aes-256-cbc";
// // // Ensure your secret key is 32 bytes (256 bits)
// // const secretKey = process.env.SECRET_KEY || "my_very_secret_key_32_chars!!";

// // function encrypt(text) {
// //   // Create a random initialization vector
// //   const iv = crypto.randomBytes(16);
// //   const cipher = crypto.createCipheriv(
// //     algorithm,
// //     Buffer.from(secretKey, "utf8"),
// //     iv
// //   );
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   encrypted += cipher.final("hex");
// //   // Prepend the IV so it can be used in decryption (format: iv:encrypted)
// //   return iv.toString("hex") + ":" + encrypted;
// // }

// // module.exports = { encrypt };
// // utils/encryption.js
// const crypto = require("crypto");
// const algorithm = "aes-256-cbc";

// // Accept a secret key of any length by deriving a 32-byte key using SHA-256.
// const rawSecretKey =
//   process.env.SECRET_KEY || "my_very_secret_key_that_can_be_any_length";
// const secretKey = crypto.createHash("sha256").update(rawSecretKey).digest();

// /**
//  * Encrypts a short text (max 16 bytes) and returns a fixed 64-character hex string.
//  * @param {string} text - The plaintext to encrypt (must be ≤16 bytes).
//  * @returns {string} The encrypted value as 64 hex characters.
//  */
// function encrypt(text) {
//   // Ensure the text is short enough
//   if (Buffer.byteLength(text, "utf8") > 16) {
//     throw new Error(
//       "Text must be 16 bytes or less for fixed-length encryption"
//     );
//   }

//   // Create a random initialization vector (IV) of 16 bytes
//   const iv = crypto.randomBytes(16);

//   // Create the cipher with the derived secretKey and IV
//   const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   encrypted += cipher.final("hex");

//   // Concatenate IV (32 hex characters) and encrypted text (should be 32 hex characters)
//   const result = iv.toString("hex") + encrypted;

//   // Sanity check: result must be exactly 64 characters
//   if (result.length !== 64) {
//     throw new Error(
//       "Encryption result is not 64 characters, actual length: " + result.length
//     );
//   }

//   return result;
// }

// module.exports = { encrypt };
// utils/fixedToken.js
const crypto = require("crypto");

// Derive a 32-byte key from your secret (of any length)
const rawSecretKey =
  process.env.SECRET_KEY || "my_very_secret_key_that_can_be_any_length";
const secretKey = crypto.createHash("sha256").update(rawSecretKey).digest();

/**
 * Generates a fixed-length (64 hex characters) token using HMAC-SHA256.
 * Note: This is a one-way function (non-reversible).
 *
 * @param {string} text - The input text (can be arbitrarily long).
 * @returns {string} - A 64-character hexadecimal string.
 */
function encrypt(text) {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(text);
  return hmac.digest("hex");
}

module.exports = { encrypt };

