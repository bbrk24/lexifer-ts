/*
 * Copyright (c) 2021 William Baker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

class WeightedSelector<T> {
    private readonly keys: T[];
    private readonly weights: number[];
    private readonly sum: number;

    constructor(dic: Readonly<Map<T, number | undefined>>) {
        this.keys = [];
        this.weights = [];

        for (const [key, weight] of dic) {
            if (typeof weight == 'number') {
                this.keys.push(key);
                this.weights.push(weight);
            }
        }

        this.sum = this.weights.reduce((a, b) => a + b, 0);
    }

    select() {
        const pick = Math.random() * this.sum;
        let temp = 0;

        for (let i = 0; i < this.keys.length; ++i) {
            temp += this.weights[i]!;
            if (pick < temp) {
                return <T>this.keys[i];
            }
        }

        throw new Error('failed to choose options from '
            + `'${this.keys.join("', '")}'.`);
    }
}

export default WeightedSelector;
