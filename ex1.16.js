const expRec = (b, n) => {
  if (n === 1) {
    return b;
  }
  if (n % 2 === 1) {
    // err: recursive step as b is accessible only from call stack
    return exp(b, n-1)*b    
  }

  return exp(b**2, n/2);
};

const exp = (b, n, a=1) => {
  if (n === 1) {
    // final step; one-time operation
    return b * a;
  }
  if (n % 2 === 1) {
    // save b to a; one-time operation
    return exp(b, n-1, b)    
  }

  // iterative process step
  return exp(b**2, n/2, a);
};

console.log(exp(3, 4))
