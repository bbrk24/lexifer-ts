class WeightedSelector {
    private keys: string[];
    private weights: number[];
    private sum: number;
    private n: number;

    constructor(dic: { [key: string]: number | undefined }) {
        this.keys = []
        this.weights = []
        for (let key in dic) {
            let weight = dic[key];
            if (typeof weight == 'number') {
                this.keys.push(key);
                this.weights.push(weight);
            }
        }
        this.sum = this.weights.reduce((a, b) => a + b, 0);
        this.n = this.keys.length;
    }
    
    select() {
        let pick = Math.random() * this.sum;
        let temp = 0;
        for (let i = 0; i < this.n; ++i) {
            temp += this.weights[i]!;
            if (pick < temp) {
                return this.keys[i]!;
            }
        }
        throw new Error(`Failed to choose options from '${this.keys.join("', '")}'`);
    }
}

export default WeightedSelector;
