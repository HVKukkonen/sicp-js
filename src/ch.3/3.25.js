import { equal, is_null, is_undefined, tail, head, pair, set_tail, list, display, length, is_list } from "sicp";

const assoc = (key, records) => {
  return is_null(records)
         ? undefined
         : equal(key, head(head(records)))
         ? head(records)
         : assoc(key, tail(records));
};

const make_table = () => {
  const local_table = list("*table*");

  const lookup_iter = (keys, records) => {
    if (is_null(keys)) {
      return tail(records)
    }

    records = assoc(head(keys), tail(records));

    if (is_undefined(records)) {
      return undefined;
    }

    return lookup_iter(tail(keys), records)
  };

  const lookup = (keys) => lookup_iter(keys, local_table)

  const insert_iter = (keys, value, table) => {
    const subtable = assoc(head(keys), tail(local_table));

    if (is_undefined(subtable)) {
      set_tail(table,
        pair(
          list(head(keys), pair(tail(keys), value)),
          tail(table)
        ));

      return;
    }

    insert_iter(tail(keys), value, subtable)
  };

  const insert = (keys, value) => insert_iter(keys, value, local_table);
  
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
  const t1 = make_table();

  const t1_get = t1("lookup");
  const t1_put = t1("insert");

  t1_put(["key_a", "key_b"], "val_1");

  display(t1_get(list("key_a", "key_b")), "should be val_1");
  display(t1_get(list("key_a", "key_c")), "should be undef");
};

main();