import {math_floor, math_log2, math_log} from 'sicp';

const pair = (a, b) => 2**a * 3**b;

const isInteger = (n) => n - math_floor(n) < 0.0001
const log3 = (x) => math_log(x) / math_log(3);

const factorize = (p) => {
  let a_upper = math_floor(math_log2(p));
  let a_lower = 0;
  
  let b;
  let a;
  while (true) {
    // choose a at midway point of possible values
    a = math_floor((a_upper + a_lower) / 2);
    const p_b = p / 2**a;
    b = log3(p_b);

    if (isInteger(b)) {
      return [a, b];
    }

    // check if p_b is of form 2**c * 3**b where c>0
    if (isInteger(p_b) && p_b % 2 === 0) {
      a_lower = a;
    } else {
      // p_b is of form 3**b / 2**c where c>0
      a_upper = a;
    }
  }
}

const head = (p) => factorize(p)[0];
const tail = (p) => factorize(p)[1];

const main = () => {
  const a = 27;
  const b = 28;
  const p = pair(a, b);

  console.log('(a, b)', a, b);
  console.log('pair', p);
  console.log('head', head(p));
  console.log('tail', tail(p));
}

main();
