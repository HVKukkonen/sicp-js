const simpsonsIntegral = (f, a, b, n) => {
    const h = (b - a) / n
    const y = (k) => f(a + k * h)

    const kArr = (n) => [...Array(n + 1).keys()]
    const yElem = (k, n) => (k === 0 || k === n) ? y(k) : (k % 2 === 1) ? 4 * y(k) : 2 * y(k)

    return h / 3 * kArr(n).map((k) => yElem(k, n)).reduce((a, b) => a + b, 0)
}

console.log(simpsonsIntegral((x) => x**3, 0, 1, 1000))