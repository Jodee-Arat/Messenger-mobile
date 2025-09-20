export default function modInverse(e: bigint, phi: bigint) {
  let [a, b] = [e, phi];
  let [x0, x1] = [0n, 1n];

  while (a !== 0n) {
    const q = b / a;
    [b, a] = [a, b % a];
    [x0, x1] = [x1, x0 - q * x1];
  }

  return x0 < 0n ? x0 + phi : x0;
}
