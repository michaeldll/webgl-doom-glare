/**
 * @returns A number in the range [min, max]
 */
export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

/**
 * @returns Value mapped to the range [out_min, out_max]
 */
export function map(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

/**
 * @description Linearly interpolate
 */
export function lerp(start: number, end: number, alpha: number) {
    return (1 - alpha) * start + alpha * end;
}

/**
* @returns Average of an array
*/
export function getAverage(arr: Array<number>) {
    let sum = 0;

    for (let index = 0; index < arr.length; index++) {
        sum = sum + arr[index];
    }

    const avg = sum / arr.length;

    return avg !== Infinity ? avg : 0;
}

// Warning: might be slow as it parses string
export function round(value: number, significantNumbers: number) {
    return Number.parseFloat(value.toFixed(significantNumbers));
}

/**
 * @returns Normalized value
 */
export function normalize(val: number, max: number, min: number) {
    return (val - min) / (max - min);
}

/**
 * @returns Distance between two points w/ pythagoras
 */
export function distance(x1: any, y1: any, x2: any, y2: any) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

export const polarToCartesian = (radius: number, theta: number) => {
  return [radius * Math.cos(theta), radius * Math.sin(theta)] as [number, number]
}