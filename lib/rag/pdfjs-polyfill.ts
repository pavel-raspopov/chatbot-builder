/**
 * PDF.js (via unpdf) expects Math.sumPrecise; Node does not ship it yet.
 * Basic polyfill matching what PDF.js previously bundled.
 */
export function ensurePdfJsMathPolyfills(): void {
  const math = Math as Math & {
    sumPrecise?: (numbers: Iterable<number>) => number;
  };
  if (typeof math.sumPrecise !== "function") {
    math.sumPrecise = function sumPrecise(numbers: Iterable<number>): number {
      return Array.from(numbers).reduce((a, b) => a + b, 0);
    };
  }
}
