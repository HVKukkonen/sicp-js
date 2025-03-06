import { equal, is_null, is_undefined, tail, head, pair, set_tail, list, display } from "sicp";

const make_table = (same_key) => {
  const local_table = list("*table*");

  const assoc = (key, records) => {
    if (is_null(records)) {
      return undefined;
    }

    const first_pair = head(records)

    return same_key(key, head(first_pair)) ? first_pair : assoc(key, tail(records))
  }

  const lookup = (key_1, key_2) => {
    const subtable = assoc(key_1, tail(local_table));

    if (is_undefined(subtable)) {
      return undefined;
    } else {
      const record = assoc(key_2, tail(subtable));

      return is_undefined(record)
        ? undefined
        : tail(record);
    }
  };

  const insert = (key_1, key_2, value) => {
    const subtable = assoc(key_1, tail(local_table));

    if (is_undefined(subtable)) {
      set_tail(local_table,
        pair(
          list(key_1, pair(key_2, value)),
          tail(local_table)
        ));
    } else {
      const record = assoc(key_2, tail(subtable));

      if (is_undefined(record)) {
        set_tail(
          subtable,
          pair(pair(key_2, value), tail(subtable))
        );
      } else {
        set_tail(record, value);
      }
    }
  };

  const dispatch = (m) => {
    return m === "lookup"
      ? lookup
      : m === "insert"
        ? insert
        : error(m, "unknown operation -- table");
  };

  return dispatch;
};

const main = () => {
  const t1 = make_table(equal);

  const t1_get = t1("lookup");
  const t1_put = t1("insert");

  t1_put("key_a", "key_b", "val_1");

  display(t1_get("key_a", "key_b"), "should be val_1");

  const same_magnitude = (input, reference) => input >= reference && input < reference * 10;

  const t2 = make_table(same_magnitude);

  const t2_get = t2("lookup");
  const t2_put = t2("insert");

  t2_put(1, 10, "mag_1");
  t2_put(10, 100, "mag_2");
  t2_put(100, 1000, "mag_3");

  display(t2_get(1, 10), "should be mag_1");
  display(t2_get(30, 500), "should be mag_2");
};

main();
