import {head, tail, is_number, is_string, is_pair, list, display_list, display} from 'sicp';

const differentlyTyped = (a, b, predicates) => {
  for (const predicate of predicates) {
    if (predicate(a) !== predicate(b)) {
      return true
    }
  }
}

const equal = (a, b) => {
  if (is_pair(a)) {
    if (!is_pair(b)) {
      return false
    }

    return equal(head(a), head(b)) && equal(tail(a), tail(b))
  }

  if (differentlyTyped(a, b, [is_number, is_string])) {
    return false
  }

  return a === b;
}

const main = () => {
  const a = list('is', 'list')
  const b = list('is', 'list')
  const c = list('is', list('not', 'a list'))
  const d = list()

  display_list(a, 'a')
  display_list(b, 'b')
  display_list(c, 'c')
  display_list(d, 'd')
  display('a equals b')
  display(equal(a, b))
  display('a equals c')
  display(equal(a, c))
  display('d equals d')
  display(equal(d, d))
}

main()
