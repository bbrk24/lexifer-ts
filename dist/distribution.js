"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WeightedSelector = /** @class */ (function () {
    function WeightedSelector(dic) {
        this.keys = [];
        this.weights = [];
        for (var key in dic) {
            this.keys.push(key);
            this.weights.push(dic[key]);
        }
        this.sum = this.weights.reduce(function (a, b) { return a + b; }, 0);
        this.n = this.keys.length;
    }
    WeightedSelector.prototype.select = function () {
        var pick = Math.random() * this.sum;
        var temp = 0;
        for (var i = 0; i < this.n; ++i) {
            temp += this.weights[i];
            if (pick < temp) {
                return this.keys[i];
            }
        }
        return 'woo!';
    };
    return WeightedSelector;
}());
exports.default = WeightedSelector;
