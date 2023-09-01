import {head, pair, tail, list, display_list, is_null} from 'sicp';

const union_set = (a, b) => {
  if (is_null(a)) {
    return b
  }
  if (is_null(b)) {
    return a
  }

  const a_item = head(a);
  const b_item = head(b);

  if (a_item < b_item) {
    return pair(a_item, union_set(tail(a), b))
  }

  if (a_item > b_item) {
    return pair(b_item, union_set(a, tail(b)))
  }

  return union_set(tail(a), b)
}

const main = () => {
  const a = list(0, 2, 3)
  const b = list(1, 2)

  display_list(a, 'a ==')
  display_list(b, 'b ==')
  display_list(union_set(a, b), 'a union b ==')
  display_list(union_set(list(), a), 'a union empty ==')
}

main()
