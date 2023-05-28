import {display, head, pair, stringify, tail} from 'sicp';

const make_segment = (start, end) => pair(start, end);

const start_segment = (segment) => head(segment);

const end_segment = (segment) => tail(segment);

const make_point = (x, y) => pair(x, y);

const x_point = (point) => head(point);

const y_point = (point) => tail(point);

const average = (a, b) => (a + b) / 2

const midpoint_segment = (segment) => make_point(
  average(x_point(start_segment(segment)), x_point(end_segment(segment))),
  average(y_point(start_segment(segment)), y_point(end_segment(segment)))
);

const print_point = (p) => display("(" + stringify(x_point(p)) + "," + stringify(y_point(p)) + ")");

const main = () => {
  print_point(
    midpoint_segment(
      make_segment(
        make_point(0,0),
        make_point(0,3)
      )
    )
  );
};

main();
