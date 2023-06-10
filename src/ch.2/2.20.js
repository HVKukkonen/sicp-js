import {list, head, tail, display_list, display, is_function, is_list, length} from 'sicp';

const plus_curried = (x) => (y) => y + x;

const brooks = (operation, data) => {
  if (!data) {
    return 0;
  }
  return operation(head(data))(brooks(operation, tail(data)));
}

const brooks_curried = (input) => {
  if (!is_list(input) || !tail(input) || !is_function(head(input))) {
    throw new Error(`Unvalid input: ${JSON.stringify(input)}`);
  }
  if (length(input) == 2) {
    // applying the operation in head directly enables nesting brooks_curried
    // as it's defined for list input only 
    return head(input)(head(tail(input)))
  } else {
    // apply the operation in head to a tail of arbitrary length
    return brooks(head(input), tail(input))
  }
}

const main = () => {
  // simple brooks
  const i1 = list(0, 2, 4);
  display_list(i1, 'i1')
  display(brooks(plus_curried, i1), 'sum of i1')
  display(brooks(plus_curried, list()), 'sum of empty')
  
  // curried brooks -----------------------------------------
  const i2 = list(plus_curried, 0, 2, 4);
  display_list(i2, 'i2')
  display(brooks_curried(i2), 'sum of i2')

  const i3 = list(
    brooks_curried,
    list(
      plus_curried,
      3,
      4
    )
  )
  display(brooks_curried(i3), 'sum of i3')

  const i4 = list(
    brooks_curried,
    list(brooks_curried, list(plus_curried, 3, 4))
  );
  display(brooks_curried(i4), 'sum of i4')
}

main()
