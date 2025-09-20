export function modPow(base: bigint, exponent: bigint, modulus: bigint) {
  base = BigInt(base);
  exponent = BigInt(exponent);
  modulus = BigInt(modulus);
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) result = (result * base) % modulus;
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }
  return result;
}
