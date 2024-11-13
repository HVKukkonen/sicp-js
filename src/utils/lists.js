import { head, tail, list, display, stringify } from "sicp";
import { assert } from "./tests.js";

export const elem_at_i = (i, list) => {
  if (i === 0) {
    return head(list);
  }

  return elem_at_i(i - 1, tail(list));
};

const main = () => {
  const l1 = list(23, 72, 149, 34);
  display(elem_at_i(2, l1), `element 2 of ${stringify(l1)} is`);
  assert(elem_at_i(2, l1) === 149, "element 2 should have been 149");
  
  const l2 = list(1);
  display(elem_at_i(0, l2), `element 0 of ${stringify(l2)} is`);
  assert(elem_at_i(0, l2) === 1, "element 0 should have been 1");
  
  const l3 = list(1, 2, 3);
  display(elem_at_i(1, l3), `element 1 of ${stringify(l3)} is`);
  assert(elem_at_i(1, l3) === 2, "element 1 should have been 2");
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
