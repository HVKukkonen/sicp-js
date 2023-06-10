import {list, pair, head, tail, display_list} from 'sicp';

const reverse = (input) => {
  if (!input) {
    return undefined;
  }
  const parent = head(input);
  return pair(reverse(tail(input)), parent)
}

const main = () => {
  const lst1 = list(1, 2, 3);

  display_list(lst1, 'lst1');
  display_list(reverse(lst1), 'lst1 rev.');
  display_list(reverse(list()), 'rev empty');
}

main()
