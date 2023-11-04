import {
  display,
  display_list,
  head,
  is_null,
  is_pair,
  pair,
  tail,
  is_undefined,
} from "sicp";

// NOTE: the implementation is for pairs only

const is_falsy = (input) => is_null(input) || is_undefined(input);

// imperative version of the pair counting function
const count_pairs = (input) => {
  let encountered;
  let count = 1;
  let first_run = true;

  const is_encountered = (candidate) => {
    // needed for that an empty list is represented as null
    if (is_falsy(encountered)) {
      return false;
    }

    const dispatch = (remainder) => {
      if (candidate === head(remainder)) {
        return true;
      }

      if (is_falsy(tail(remainder))) {
        return false;
      }

      return dispatch(tail(remainder));
    };

    return dispatch(encountered);
  };

  // imperative version of the dispatch function
  const dispatch = (lst) => {
    // utilises the dispatcher's logic also for the 1st run but skips recording the encounter
    if (!first_run) {
      if (!is_pair(lst) || is_encountered(lst)) {
        return;
      }

      encountered = encountered ? pair(lst, encountered) : pair(lst, null);
      count = count + 1;
    } else {
      first_run = false;
    }

    if (is_pair(head(lst)) && !is_encountered(head(lst))) {
      dispatch(head(lst));
    }

    if (is_pair(tail(lst)) && !is_encountered(tail(lst))) {
      dispatch(tail(lst));
    }
  };

  if (!is_pair(input)) {
    return 0;
  }

  dispatch(input)

  return count;
};

// functional version
const count_pairs_functional = (input) => {
  let first_run = true;

  const is_encountered = (candidate, encountered) => {
    // needed for that an empty list is represented as null
    if (is_falsy(encountered)) {
      return false;
    }

    const dispatch = (remainder) => {
      if (candidate === head(remainder)) {
        return true;
      }

      if (is_falsy(tail(remainder))) {
        return false;
      }

      return dispatch(tail(remainder));
    };

    return dispatch(encountered);
  };

  const dispatch = (lst, encountered) => {
    // utilises the dispatcher's logic also for the 1st run but skips recording the encounter
    if (!first_run) {
      if (!is_pair(lst) || is_encountered(lst, encountered)) {
        return 0;
      }

      encountered = encountered ? pair(lst, encountered) : pair(lst, null);
    } else {
      first_run = false;
    }

    return (
      1 + dispatch(head(lst), encountered) + dispatch(tail(lst), encountered)
    );
  };

  if (!is_pair(input)) {
    return 0;
  }

  return dispatch(input);
};

const main = () => {
  // building blocks
  const i = pair(10, 20);
  const r1 = pair(1, i);

  // test cases
  const a = pair(pair(1, 2), pair(2, 3));
  const b = pair(i, i);
  const c = pair(r1, r1);
  const d = pair(b, b);

  display("functional implementation:");
  for (const test of [a, b, c, d]) {
    display_list(test, "list:");
    display(
      count_pairs_functional(test),
      "consist of how many distinct pairs? -"
    );
  }

  display('-------------------------------------');
  display("imperative implementation:");
  for (const test of [a, b, c, d]) {
    display_list(test, "list:");
    display(
      count_pairs(test),
      "consist of how many distinct pairs? -"
    );
  }


  display('-------------------------------------');
  display("imperative implementation considers the referential equality");
};

main();
