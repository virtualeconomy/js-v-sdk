export function calculateSwapTokenForExactBaseToken(amountOut, reservedA, reservedB) {
  let mulValue = reservedB * 1000;
  let numerator = mulValue * amountOut;
  let subValue = reservedA - amountOut;
  let denominator = subValue * 997;
  return Math.floor(numerator / denominator) + 1;
}

export function calculateSwapExactTokenForBaseToken(amountIn, reservedA, reservedB) {
  let amountInWithoutFee = amountIn * 997;
  let mulValue = reservedB * 1000;
  let numerator = reservedA * amountInWithoutFee;
  let denominator = mulValue + amountInWithoutFee;
  return Math.floor(numerator / denominator);
}

export function calculateSwapTokenForExactTargetToken(amountOut, reservedA, reservedB) {
  let mulValue = reservedA * 1000;
  let numerator = mulValue * amountOut;
  let subValue = reservedB - amountOut;
  let denominator = subValue * 997;
  return Math.floor(numerator / denominator) + 1;
}

export function calculateSwapExactTokenForTargetToken(amountIn, reservedA, reservedB) {
  let amountInWithoutFee = amountIn * 997;
  let mulValue = reservedA * 1000;
  let numerator = reservedB * amountInWithoutFee;
  let denominator = mulValue + amountInWithoutFee;
  return Math.floor(numerator / denominator);
}
