import BigNumber from "bignumber.js";

export function calculateSwapTokenForExactBaseToken(amountOut, reservedA, reservedB) {
  let mulValue = new BigNumber(reservedB).multipliedBy(1000);
  let numerator = mulValue.multipliedBy(amountOut);
  let subValue = new BigNumber(reservedA).minus(amountOut);
  let denominator = subValue.multipliedBy(997);
  let result = numerator.dividedBy(denominator)
  return result.integerValue(BigNumber.ROUND_DOWN) + 1;
}

export function calculateSwapExactTokenForBaseToken(amountIn, reservedA, reservedB) {
  let amountInWithoutFee = new BigNumber(amountIn).multipliedBy(997);
  let mulValue = new BigNumber(reservedB).multipliedBy(1000);
  let numerator = new BigNumber(reservedA).multipliedBy(amountInWithoutFee);
  let denominator = mulValue.plus(amountInWithoutFee);
  let result = numerator.dividedBy(denominator);
  return result.integerValue(BigNumber.ROUND_DOWN);
}

export function calculateSwapTokenForExactTargetToken(amountOut, reservedA, reservedB) {
  let mulValue = new BigNumber(reservedA).multipliedBy(1000);
  let numerator = mulValue.multipliedBy(amountOut);
  let subValue = new BigNumber(reservedB).minus(amountOut);
  let denominator = subValue.multipliedBy(997);
  let result = numerator.dividedBy(denominator);
  return result.integerValue(BigNumber.ROUND_DOWN) + 1;
}

export function calculateSwapExactTokenForTargetToken(amountIn, reservedA, reservedB) {
  let amountInWithoutFee = new BigNumber(amountIn).multipliedBy(997);
  let mulValue = new BigNumber(reservedA).multipliedBy(1000);
  let numerator = new BigNumber(reservedB).multipliedBy(amountInWithoutFee);
  let denominator = mulValue.plus(amountInWithoutFee);
  let result = numerator.dividedBy(denominator)
  return result.integerValue(BigNumber.ROUND_DOWN);
}
