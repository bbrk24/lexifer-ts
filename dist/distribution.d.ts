declare class WeightedSelector {
    private keys;
    private weights;
    private sum;
    private n;
    constructor(dic: {
        [key: string]: number;
    });
    select(): string;
}
export default WeightedSelector;
