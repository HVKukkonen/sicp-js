import {display, display_list, error, head, math_PI, math_cos, math_sin, pair} from 'sicp';

// message passing implementation of a data constructor that handles different representations
const make_from_mag_ang = (r, a) => (op) => 
    op === 'real_part'
    ? r * math_cos(a)
    : op === 'imag_part'
    ? r * math_sin(a)
    : op === 'magnitude'
    ? r
    : op === 'angle'
    ? a
    : error(op, 'unknown op --')

const make_polar = (r, a) => pair(make_from_mag_ang(r, a), 'polar')

const apply_generic = (op, arg) => head(arg)(op);

const main = () => {
  const polar_point = make_polar(1, math_PI/4)

  display_list(apply_generic('real_part', polar_point), 'real_part only');
  display_list(pair(apply_generic('real_part', polar_point), apply_generic('imag_part', polar_point)), 'both')
}

main();
