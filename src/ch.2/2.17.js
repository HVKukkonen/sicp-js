import { display, length, list, stringify, tail } from "sicp";

const last_pair = (l) => {
  if (length(l) === 1) {
    return l
  }
  return last_pair(tail(l))
}

const main = () => {
  const l1 = list(23, 72, 149, 34);
  const l2 = list(1)
  const l3 = list(1, 2, 3)

  display(last_pair(l1), `last of ${stringify(l1)} is`);
  display(last_pair(l2), `last of ${stringify(l2)} is`);
  display(last_pair(l3), `last of ${stringify(l3)} is`);
}

main();
