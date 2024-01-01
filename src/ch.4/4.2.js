import { accumulate, display, head, is_pair, parse, stringify, tail, display_list, is_string } from 'sicp';

const string_col = (value) => stringify(value) + ';'

const is_tagged_list = (component) => is_pair(component) && is_string(head(component))
// const has_tag = (component, the_tag) => is_tagged_list(component) && head(component) === the_tag;

// prettifiers
const pretty_args = (args) => args.substring(0, args.length - 1).replaceAll(';', ', ');
const pretty_semis = (expression) => expression.replaceAll(';', '') + ';';

const operations = {
  name: (input) => input[0] + ';',
  literal: (input) => input[0] + ';',
  application: (input) => raw_unparse(head(input)) + '(' + pretty_args(raw_unparse(tail(input)[0])) + ')',
  binary_operator_combination: (input) => raw_unparse(tail(input)[0]) + head(input) + raw_unparse(tail(input)[1]),
  conditional_expression: (input) => raw_unparse(input[0]) + ' ? ' + raw_unparse(input[1]) + ' : ' + raw_unparse(input[2]),
}

const unparse_element = (tagged_list) => (operations[head(tagged_list)] ?? (() => display_list(tagged_list, '\ncould not identify:')))(tail(tagged_list));

const raw_unparse = (component) => {
  if (!is_pair(component)) {
    return '';
  }
  if (is_tagged_list(component)) {
    return unparse_element(component);
  }

  return raw_unparse(head(component)) + raw_unparse(tail(component))
}

const unparse = (expression) => pretty_semis(raw_unparse(expression));

(() => {
  for (const notation of ['1;', 'pi;', 'fun(x1, x2);', '2 + 1;', 'pi * f(pi);', 'x === 0 ? x : 0;']) {
    display(notation, 'input to parse-unparse:')
    display(unparse(parse(notation)), 'result:')
  }
  // display(accumulate((s1, s0) => s1 + s0, '', list('x1', 'x2')))
})()
