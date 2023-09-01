import {display, display_list, head, is_null, list, pair, tail} from 'sicp';

const adjoin_set = (x, set) => {
  if (is_null(set)) {
    return pair(x, null)
  }

  const i_elem = head(set);
  
  if (i_elem > x) {
    return pair(x, set);
  }

  if (i_elem === x) {
    return set;
  }

  return adjoin_set(head(set), adjoin_set(x, tail(set)))
}

const is_element_of_set = (x, set) => {
  const i_elem = head(set);

  if (x > i_elem) {
    return is_element_of_set(x, tail(set));
  }

  if (x < i_elem) {
    return false;
  }

  return true;
}

const main = () => {
  const a = list(1, 2)

  display_list(a, 'a ==')
  display_list(adjoin_set(0, a), 'a add 0 ==')
  display_list(adjoin_set(3, a), 'a add 3')
  display_list(adjoin_set(2, a), 'a add 2')
  display(is_element_of_set(1, a), '1 in a:')
  display(is_element_of_set(2, a), '2 in a:')
  display(is_element_of_set(0, a), '0 in a:')
}

main()
