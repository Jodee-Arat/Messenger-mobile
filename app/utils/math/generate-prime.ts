import isPrime from "./is-prime";

export default function generatePrime(min = 1000n, max = 100000n): bigint {
  let prime;
  do {
    prime = BigInt(
      Math.floor(
        Number(min + BigInt(Math.floor(Math.random() * Number(max - min))))
      )
    );
  } while (!isPrime(prime));
  return prime;
}
