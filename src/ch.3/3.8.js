import {display_list, error, pair} from 'sicp';

const constructor = (f) => {
  let filter = 0;

  const flip_and_return = (y) => {
    filter = (filter + 1) % 2
    return y;
  };
  const read_filter = () => filter;

  return (x) => read_filter() === 1 ? flip_and_return(0) : flip_and_return(f(x))
}

const f = constructor((x) => x);
const f2 = constructor((x) => x);

const assert_equal = (a, b) => a === b ? display_list(pair(a, b), 'equal') : error(pair(a, b), 'not equal')

const main = () => {
  assert_equal(f(0) + f(1), 0)
  assert_equal(f2(1) + f2(0), 1)
}

main()
