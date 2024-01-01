import {build_list, display, display_list, head, list_to_stream, math_abs, math_random, stream_tail} from 'sicp';

const stream_limit = (stream, tolerance) => {
  const a = head(stream);
  const tail_stream = stream_tail(stream);
  const b = head(tail_stream);

  if (math_abs(a - b) < tolerance) {
    return b;
  }

  return stream_limit(tail_stream, tolerance);
}

const random_list = build_list(math_random, 15)
const random_stream = list_to_stream(random_list);

const main = () => {
  display_list(random_list, 'in\n')
  display(stream_limit(random_stream, 0.1), 'the 1st element differing less than tolerance is');
}

main();
