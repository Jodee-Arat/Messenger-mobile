import isPrime from "./is-prime";

export function isPrimitiveRoot(g: bigint, p: bigint) {
  if (!isPrime(p)) return false;
  let required = new Set();
  for (let i = 1n; i < p; i++) required.add(i.toString());
  let curr = 1n;
  for (let i = 1n; i < p; i++) {
    curr = (curr * g) % p;
    required.delete(curr.toString());
  }
  return required.size === 0;
}
