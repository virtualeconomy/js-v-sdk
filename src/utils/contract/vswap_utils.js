import BigNumber from "bignumber.js";

export function calculateSwapTokenForExactBaseToken(amountOut, reservedBase, reservedTarget) {
  let mulValue = new BigNumber(reservedTarget).multipliedBy(1000);
  let numerator = mulValue.multipliedBy(amountOut);
  let subValue = new BigNumber(reservedBase).minus(amountOut);
  let denominator = subValue.multipliedBy(997);
  let result = numerator.dividedBy(denominator)
  return result.integerValue(BigNumber.ROUND_DOWN).plus(1);
}

export function calculateSwapExactTokenForBaseToken(amountIn, reservedBase, reservedTarget) {
  let amountInWithoutFee = new BigNumber(amountIn).multipliedBy(997);
  let mulValue = new BigNumber(reservedTarget).multipliedBy(1000);
  let numerator = new BigNumber(reservedBase).multipliedBy(amountInWithoutFee);
  let denominator = mulValue.plus(amountInWithoutFee);
  let result = numerator.dividedBy(denominator);
  return result.integerValue(BigNumber.ROUND_DOWN);
}

export function calculateSwapTokenForExactTargetToken(amountOut, reservedBase, reservedTarget) {
  let mulValue = new BigNumber(reservedBase).multipliedBy(1000);
  let numerator = mulValue.multipliedBy(amountOut);
  let subValue = new BigNumber(reservedTarget).minus(amountOut);
  let denominator = subValue.multipliedBy(997);
  let result = numerator.dividedBy(denominator);
  return result.integerValue(BigNumber.ROUND_DOWN).plus(1);
}

export function calculateSwapExactTokenForTargetToken(amountIn, reservedBase, reservedTarget) {
  let amountInWithoutFee = new BigNumber(amountIn).multipliedBy(997);
  let mulValue = new BigNumber(reservedBase).multipliedBy(1000);
  let numerator = new BigNumber(reservedTarget).multipliedBy(amountInWithoutFee);
  let denominator = mulValue.plus(amountInWithoutFee);
  let result = numerator.dividedBy(denominator)
  return result.integerValue(BigNumber.ROUND_DOWN);
}
