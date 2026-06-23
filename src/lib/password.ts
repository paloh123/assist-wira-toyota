const ITERATIONS = 120000;
const KEY_LENGTH = 256;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function derivePassword(password: string, saltHex: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: hexToBytes(saltHex),
      iterations: ITERATIONS,
    },
    key,
    KEY_LENGTH
  );

  return bytesToHex(new Uint8Array(bits));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export async function hashPassword(password: string) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = bytesToHex(salt);
  const hash = await derivePassword(password, saltHex);
  return `pbkdf2$${ITERATIONS}$${saltHex}$${hash}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterations, salt, hash] = storedHash.split("$");

  if (
    algorithm !== "pbkdf2" ||
    iterations !== String(ITERATIONS) ||
    !salt ||
    !hash
  ) {
    return false;
  }

  const inputHash = await derivePassword(password, salt);
  return constantTimeEqual(inputHash, hash);
}
