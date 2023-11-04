import {list, pair, tail, display_list, display, set_tail, is_null} from 'sicp';

// given as part of the exercise
const last_pair = (x) => is_null(tail(x)) ? x : last_pair(tail(x));
const make_cycle = (x) => {
  set_tail(last_pair(x), x);
  return x;
}

const is_cycle = (lst) => {
  let tortoise = lst;
  let haire = lst;

  // based on the idea in https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare
  while (true) {
    try {
      tortoise = tail(tortoise);
      haire = tail(tail(haire));

      if (tortoise === haire) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
};

const main = () => {
  const i = pair(1, 2)

  const a = list(1, 2, 3)
  const b = make_cycle(list(1, 2, 3))
  display_list(a)
  display(is_cycle(a), 'a has cycle? -')
  display_list(b)
  display(is_cycle(b), 'b has cycle? -')
}

main();
