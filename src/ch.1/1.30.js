const sum = (term, a, next, b) => {
  next = (b - a) / 10
  const iter = (a, result) => (a >= b)
    ? result
    : iter(a + next, result + term(a))

  return iter(a, 0)
}

console.log(sum((x) => x, 0, 0, 1))