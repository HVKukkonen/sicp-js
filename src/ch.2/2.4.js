import {display, stringify} from 'sicp';

const pair = (x, y) => ((m) => m(x, y));

const head = (z) => z((p, q) => p);

const tail = (z) => z((_, q) => q);

const main = () => {
  const p1 = pair({ key: 'x', value: 2 }, 'dont pick me')
  const p2 = pair({ key: 'x', value: 2 }, 'yes pick me')
  display(stringify(head(p1)))
  display(stringify(tail(p2)))
};

main();
