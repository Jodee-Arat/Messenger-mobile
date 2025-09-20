export default function isPrime(n: bigint) {
  if (n < 2n) return false;
  for (let i = 2n; i * i <= n; i++) {
    if (n % i === 0n) return false;
  }
  return true;
}
