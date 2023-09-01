import {display, display_list, equal, head, is_null, list, pair, tail} from 'sicp';

const is_element_of_set = (x, set) => is_null(set)
  ? false
  : equal(x, head(set))
  ? true
  : is_element_of_set(x, tail(set));

const union_set = (set1, set2) => is_null(set1)
  ? set2
  : is_element_of_set(head(set1), set2)
  ? union_set(tail(set1), set2)
  : pair(head(set1), union_set(tail(set1), set2));

const main = () => {
  const data = new Map()
  
  data.set('a', list(1, 2, 4))
  data.set('b', list(2, 1, 5))
  data.set('c', list('c'))
  
  const announce_union = (aKey, bKey) => {
    display('--------------------------------------')
    display_list(data.get(aKey));
    display('union')
    display_list(data.get(bKey));
    display('=')
  }

  const union_set_test = (aKey, bKey) => union_set(data.get(aKey), data.get(bKey))

  announce_union('a', 'b')
  display_list(union_set_test('a', 'b'))
  announce_union('c', 'c')
  display_list(union_set_test('c', 'c'))
  announce_union('null', 'null')
  display_list(union_set(null, null))
}

main()
