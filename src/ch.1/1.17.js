// import { double, halve } from 'sicp';

const double = (x) => x * 2;
const halve = (x) => x / 2;

export const times = (b, a) => {
    if (a === 1) {
        return b;
    }
    if (a % 2 === 1) {
        return b + times(b, a - 1);
    }
    return times(double(b), halve(a));
};
