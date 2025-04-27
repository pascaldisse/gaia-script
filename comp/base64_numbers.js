/**
 * Base64 Number Encoding System for GaiaScript
 * 
 * Based on the new number encoding specification from num.md
 * This file implements the Base64 number system for GaiaScript
 */

// The Base64 alphabet used for encoding numbers
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Converts a decimal number to its base64 representation
 * @param {number} n - The decimal number to convert
 * @returns {string} - The base64 representation
 */
function toBase64Number(n) {
  if (n === 0) {
    return "A";
  }
  const digits = [];
  while (n > 0) {
    const remainder = n % 64;
    digits.push(BASE64_ALPHABET[remainder]);
    n = Math.floor(n / 64);
  }
  return digits.reverse().join('');
}

/**
 * Converts a base64 string to its decimal value
 * @param {string} s - The base64 string to convert
 * @returns {number} - The decimal value
 */
function fromBase64Number(s) {
  let value = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const digit = BASE64_ALPHABET.indexOf(char);
    if (digit === -1) {
      throw new Error(`Invalid base64 character: ${char}`);
    }
    value = value * 64 + digit;
  }
  return value;
}

/**
 * Formats a number using the GaiaScript Base64 notation
 * @param {number} num - The number to format
 * @returns {string} - The formatted base64 number in GaiaScript syntax (#⟨...⟩)
 */
function formatBase64Number(num) {
  return `#⟨${toBase64Number(num)}⟩`;
}

/**
 * Parses a GaiaScript Base64 number
 * @param {string} str - The GaiaScript Base64 number string (#⟨...⟩)
 * @returns {number} - The decimal value
 */
function parseBase64Number(str) {
  // Extract the base64 part from the syntax
  const base64Match = str.match(/#⟨([A-Za-z0-9+/]+)⟩/);
  if (!base64Match) {
    throw new Error(`Invalid Base64 number format: ${str}`);
  }
  
  const base64Str = base64Match[1];
  return fromBase64Number(base64Str);
}

// Examples of common values in Base64 format
const BASE64_EXAMPLES = {
  ZERO: "A",           // 0
  ONE: "B",            // 1
  TEN: "K",            // 10
  SIXTY_FOUR: "BA",    // 64
  HUNDRED: "Bc",       // 100
  THOUSAND: "Pd",      // 1000
  MILLION: "3+8w",     // 1000000
  BILLION: "4c9184"    // 1000000000
};

// Module exports for Node.js
module.exports = {
  BASE64_ALPHABET,
  toBase64Number,
  fromBase64Number,
  formatBase64Number,
  parseBase64Number,
  BASE64_EXAMPLES
};

// Test code 
if (require.main === module) {
  console.log("Base64 Number System Test");
  console.log("========================");
  
  const testNumbers = [0, 1, 10, 64, 100, 123, 1000, 1000000, 1000000000];
  
  console.log("Decimal → Base64:");
  for (const num of testNumbers) {
    const base64 = toBase64Number(num);
    console.log(`${num.toString().padStart(10)} → ${base64}`);
  }
  
  console.log("\nBase64 → Decimal:");
  const testBase64 = ["A", "B", "K", "BA", "Bc", "B7", "Pd", "3+8w", "4c9184"];
  
  for (const b64 of testBase64) {
    const decimal = fromBase64Number(b64);
    console.log(`${b64.padStart(10)} → ${decimal}`);
  }
  
  console.log("\nFormatted GaiaScript Base64 Numbers:");
  for (const num of testNumbers) {
    const formatted = formatBase64Number(num);
    console.log(`${num.toString().padStart(10)} → ${formatted}`);
  }
  
  console.log("\nParsing GaiaScript Base64 Numbers:");
  const testFormatted = [
    "#⟨A⟩", "#⟨B⟩", "#⟨K⟩", "#⟨BA⟩", "#⟨Bc⟩", "#⟨B7⟩", "#⟨Pd⟩", "#⟨3+8w⟩", "#⟨4c9184⟩"
  ];
  
  for (const formatted of testFormatted) {
    try {
      const decimal = parseBase64Number(formatted);
      console.log(`${formatted.padStart(10)} → ${decimal}`);
    } catch (error) {
      console.error(`Error parsing ${formatted}: ${error.message}`);
    }
  }
}