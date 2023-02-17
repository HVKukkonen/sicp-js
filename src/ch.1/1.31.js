// a.
const product = (term, a, next, b) => {
  const iter = (a, result) => (a > b)
    ? result
    : iter(a + next, result * term(a))

  return iter(a, 1)
}

console.log('product', product((x) => x, 1, 1, 3))

const factorial = (n) => product((x) => x, 1, 1, n)

console.log('factorial', factorial(3))

const pi = (accuracy) => {
  const end = accuracy * 2
  const nominator = product((x) => (x === 2) ? 2 : x**2, 2, 2, end) / end
  const denominator = product((x) => x**2, 3, 2, end - 1)
  return 4 * nominator / denominator
}

console.log('pi', pi(50))

// b.
const recursiveProduct = (term, a, next, b, result) => {
  if (a > b) {
    return result
  } else {
    const pointValue = term(a)
    a = a + next
    return pointValue * recursiveProduct(term, a, next, b, result)
  }
}

console.log('recursiveProduct', product((x) => x, 1, 1, 3))
