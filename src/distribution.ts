class WeightedSelector {
    keys: string[];
    weights: number[];
    sum: number;
    n: number;

    constructor(dic: { [key: string]: number }) {
        this.keys = []
        this.weights = []
        for (let key in dic) {
            this.keys.push(key);
            this.weights.push(dic[key]!);
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
        return 'woo!';
    }
}

export default WeightedSelector;