import Decimal from "decimal.js";

/**
 * Weight is kg at 3 decimal places, backed by Decimal so precision survives box↔kg
 * coefficient math. Never coerce to `number` for arithmetic.
 */

declare const kgBrand: unique symbol;

export type Kg = Decimal & { readonly [kgBrand]: "Kg" };

const KG_DECIMAL_PLACES = 3;

export class WeightError extends Error {}

export function kg(value: Decimal.Value): Kg {
  const decimal = new Decimal(value);
  if (decimal.isNegative()) {
    throw new WeightError(`Weight cannot be negative, got ${decimal.toString()}`);
  }
  return decimal.toDecimalPlaces(KG_DECIMAL_PLACES) as Kg;
}

export const zeroKg: Kg = kg(0);

export function add(a: Kg, b: Kg): Kg {
  return kg(a.plus(b));
}

export function subtract(a: Kg, b: Kg): Kg {
  return kg(a.minus(b));
}

export function sum(values: readonly Kg[]): Kg {
  return values.reduce(add, zeroKg);
}

/** Converts a case/box count to kg using the product's koli↔kg katsayısı. */
export function fromCases(caseCount: number, kgPerCase: Decimal.Value): Kg {
  if (!Number.isInteger(caseCount) || caseCount < 0) {
    throw new WeightError(`Case count must be a non-negative integer, got ${caseCount}`);
  }
  return kg(new Decimal(kgPerCase).times(caseCount));
}

export function compare(a: Kg, b: Kg): -1 | 0 | 1 {
  return a.comparedTo(b) as -1 | 0 | 1;
}

export function isZero(a: Kg): boolean {
  return a.isZero();
}
