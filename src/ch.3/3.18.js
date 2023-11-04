import {is_null, list, pair, tail, set_tail, display_list, member, head, is_list, append, display} from 'sicp';

// given as part of the exercise
const last_pair = (x) => is_null(tail(x)) ? x : last_pair(tail(x));
const make_cycle = (x) => {
  set_tail(last_pair(x), x);
  return x;
}

const is_cycle = (lst) => {
  let encountered = list();

  const is_encountered = (candidate) => !is_null(member(candidate, encountered));

  const dispatch = (lst) => {
    if (is_encountered(head(lst))) {
      return true;
    }

    encountered = append(encountered, list(head(lst)))

    if (is_list(head(lst))) {
      if (dispatch(head(lst))) {
        return true
      }
    }

    if (is_null(tail(lst))) {
      return false;
    }

    return dispatch(tail(lst));
  }

  return dispatch(lst);
}

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
