import { is_null, tail, head, set_tail, list, display, error } from "sicp";

const make_tree_node = (key, value) => {
  // node structure: (list (key-value-pair) left-tree right-tree)
  return list(list(key, value), null, null);
};

const get_key = (node) => {
  return head(head(node));
};

const value = (node) => {
  return head(tail(head(node)));
};

const set_value = (node, new_value) => {
  set_tail(head(node), list(new_value));
  return node;
};

const left_branch = (node) => {
  return head(tail(node));
};

const right_branch = (node) => {
  return head(tail(tail(node)));
};

const set_left_branch = (node, left) => {
  set_tail(node, list(left, right_branch(node)));
  return node;
};

const set_right_branch = (node, right) => {
  set_tail(tail(node), list(right));
  return node;
};

const make_table = () => {
  let root = null;

  const insert = (key, value) => {
    const insert_iter = (node, k, v) => {
      if (is_null(node)) {
        // insert new
        return make_tree_node(k, v);
      }

      if (k < get_key(node)) {
        set_left_branch(node, insert_iter(left_branch(node), k, v));
      } else if (k > get_key(node)) {
        set_right_branch(node, insert_iter(right_branch(node), k, v));
      } else {
        // replace existing
        set_value(node, v);
      }

      return node;
    };

    root = insert_iter(root, key, value);
  };

  const lookup = (k) => {
    const lookup_iter = (node, k) => {
      if (is_null(node)) {
        return undefined;
      }

      if (k < get_key(node)) {
        return lookup_iter(left_branch(node), k);
      }

      if (k > get_key(node)) {
        return lookup_iter(right_branch(node), k);
      }

      return value(node);
    };

    return lookup_iter(root, k);
  };

  const in_order_traverse = (callback) => {
    const traverse_helper = (node, callback) => {
      if (!is_null(node)) {
        callback(get_key(node), value(node));

        traverse_helper(left_branch(node), callback);
        traverse_helper(right_branch(node), callback);
      }
    };

    traverse_helper(root, callback);
  };

  const dispatch = (message) => message === "insert" ? insert :
    message === "lookup" ? lookup :
      message === "in_order_traverse" ? in_order_traverse :
        error(message, "unknown operation -- bst");

  return dispatch;
};

const main = () => {
  const bst = make_table();

  const insert = bst("insert");
  const lookup = bst("lookup");
  const traverse = bst("in_order_traverse");

  insert(5, "value5");
  insert(3, "value3");
  insert(7, "value7");
  insert(2, "value2");
  insert(4, "value4");

  display(lookup(3), "lookup(3)");
  display(lookup(6), "lookup(6)");

  traverse((key, value) => {
    display(key + ": " + value);
  });
};

main();
