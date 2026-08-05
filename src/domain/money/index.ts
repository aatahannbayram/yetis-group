/**
 * Money is always an integer minor unit (kuruş). Float amounts are a domain error, not a rounding
 * detail — reject them at the boundary instead of coercing.
 */

declare const moneyBrand: unique symbol;

export type Money = number & { readonly [moneyBrand]: "Money" };

export class MoneyError extends Error {}

export function money(kurus: number): Money {
  if (!Number.isInteger(kurus)) {
    throw new MoneyError(`Money must be an integer kuruş value, got ${kurus}`);
  }
  return kurus as Money;
}

export const zeroMoney: Money = money(0);

export function add(a: Money, b: Money): Money {
  return money(a + b);
}

export function subtract(a: Money, b: Money): Money {
  return money(a - b);
}

export function negate(a: Money): Money {
  return money(-a);
}

export function sum(values: readonly Money[]): Money {
  return values.reduce(add, zeroMoney);
}

export function multiplyByQuantity(unit: Money, quantity: number): Money {
  if (!Number.isInteger(quantity)) {
    throw new MoneyError(`Quantity must be an integer, got ${quantity}`);
  }
  return money(unit * quantity);
}

/**
 * Rate expressed in integer basis points (1/100 of a percent — %1 KDV = 100, %18 KDV = 1800)
 * so VAT/discount math never touches a float. Rounds half away from zero to the nearest kuruş.
 */
export function applyRate(base: Money, rateBasisPoints: number): Money {
  if (!Number.isInteger(rateBasisPoints)) {
    throw new MoneyError(`Rate must be integer basis points, got ${rateBasisPoints}`);
  }
  const scaled = base * rateBasisPoints;
  const rounded = Math.sign(scaled) * Math.round(Math.abs(scaled) / 10_000);
  return money(rounded);
}

export function isNegative(a: Money): boolean {
  return a < 0;
}

export function isZero(a: Money): boolean {
  return a === 0;
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
