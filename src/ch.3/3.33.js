import { error, list, is_null, member, pair, display, stringify, head, tail } from "sicp";

const is_zero = (m) => has_value(m) && get_value(m) === 0;

// connector literals
const conlit_has_value = "has_value";
const conlit_value = "value";
const conlit_set_value = "set_value";
const conlit_forget = "forget";
const conlit_connect = "connect";

const has_value = (connector) => connector(conlit_has_value);
const get_value = (connector) => connector(conlit_value);
const set_value = (connector, new_value, informant) => connector(conlit_set_value)(new_value, informant);
const forget_value = (connector, retractor) => connector(conlit_forget)(retractor);
const connect = (connector, new_constraint) => connector(conlit_connect)(new_constraint);

// process literals
const prolit_have = "I have a value.";
const prolit_lost = "I lost my value.";

const inform_about_value = (constraint) => constraint(prolit_have);
const inform_about_no_value = (constraint) => constraint(prolit_lost);

const for_each_except = (exception, fun, list) => {
  const loop = (items) => {
    if (is_null(items)) {
      return "done";
    } else if (head(items) === exception) {
      return loop(tail(items));
    } else {
      fun(head(items));

      return loop(tail(items));
    }
  };

  return loop(list);
}

const make_connector = () => {
  let value = false;
  let informant = false;
  let constraints = null;

  const set_my_value = (newval, setter) => {
    if (!has_value(me)) {
      value = newval;
      informant = setter;
      return for_each_except(setter, inform_about_value, constraints);
    }
    if (value !== newval) {
      error(list(newval, value), "contradiction");
    }
    return "ignored";
  };

  const forget_my_value = (retractor) => {
    if (retractor === informant) {
      informant = false;
      return for_each_except(retractor, inform_about_no_value, constraints);
    }
    return "ignored";
  };

  const connect = (new_constraint) => {
    if (is_null(member(new_constraint, constraints))) {
      constraints = pair(new_constraint, constraints);
    }
    if (has_value(me)) {
      inform_about_value(new_constraint);
    }
    return "done";
  };

  const me = (request) => {
    switch (request) {
      case conlit_has_value:
        return !!informant;
        break;
      case conlit_value:
        return value;
        break;
      case conlit_set_value:
        return set_my_value;
        break;
      case conlit_forget:
        return forget_my_value;
        break;
      case conlit_connect:
        return connect;
      default:
        error(request, "unknown operation -- connector");
        break;
    }
  };

  return me;
};

const multiplier = (m1, m2, product) => {
  const process_new_value = () => {
    if (is_zero(m1) || is_zero(m2)) {
      return set_value(product, 0, me);
    }

    if (has_value(m1) && has_value(m2)) {
      return set_value(product, get_value(m1) * get_value(m2), me);
    }

    if (has_value(product) && has_value(m1)) {
      return set_value(m2, get_value(product) / get_value(m1), me);
    }

    if (has_value(product) && has_value(m2)) {
      return set_value(m1, get_value(product) / get_value(m2), me);
    }
  };

  const process_forget_value = () => {
    forget_value(product, me);
    forget_value(m1, me);
    forget_value(m2, me);
    process_new_value();
  };

  const me = (request) => {
    if (request === prolit_have) {
      return process_new_value();
    }

    if (request === prolit_lost) {
      return process_forget_value();
    }

    error(request, "unknown request -- multiplier");
  };

  connect(m1, me);
  connect(m2, me);
  connect(product, me);

  return me;
};

const adder = (a1, a2, sum) => {
  const process_new_value = () => {
    if (has_value(a1) && has_value(a1)) {
      set_value(sum, get_value(a1) + get_value(a2), me);
    }
    if (has_value(a1) && has_value(sum)) {
      set_value(a2, get_value(sum) - get_value(a1), me);
    }
    if (has_value(a2) && has_value(sum)) {
      set_value(a1, get_value(sum) - get_value(a2), me);
    }
  };

  const process_forget_value = () => {
    forget_value(product, me);
    forget_value(a1, me);
    forget_value(a2, me);
    process_new_value();
  };

  const me = (request) => {
    if (request === prolit_have) {
      return process_new_value();
    }

    if (request === prolit_lost) {
      return process_forget_value();
    }

    error(request, "unknown request -- adder");
  };

  connect(a1, me);
  connect(a2, me);
  connect(sum, me);

  return me;
};

const constant = (value, connector) => {
  const me = (request) => error(request, "unknown request -- constant");

  connect(connector, me);
  set_value(connector, value, me);

  return me;
};

const probe = (name, connector) => {
  const print_probe = (value) =>
    display(`Probe: ${name} = ${stringify(value)}`);

  const process_new_value = () => print_probe(get_value(connector));

  const process_forget_value = () => print_probe("?");

  const me = (request) =>
    request === prolit_have
      ? process_new_value()
      : request === prolit_lost
      ? process_forget_value()
      : error(request, "unknown request -- probe");

  connect(connector, me);

  return me;
};

const averager = (a, b, c) => {
  const sum = make_connector();
  adder(a, b, sum);

  const half = make_connector();
  constant(0.5, half);

  multiplier(sum, half, c);

  return "ok";
};

const main = () => {
  const mean = make_connector();
  const a = make_connector();
  const b = make_connector();

  probe("a", a);
  probe("b", b);
  probe("average", mean);
  
  set_value(a, 1, "user");
  set_value(b, 2, "user");

  averager(a, b, mean);
};

main();
