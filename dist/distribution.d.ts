declare class WeightedSelector {
    keys: string[];
    weights: number[];
    sum: number;
    n: number;
    constructor(dic: {
        [key: string]: number;
    });
    select(): string;
}
export default WeightedSelector;
