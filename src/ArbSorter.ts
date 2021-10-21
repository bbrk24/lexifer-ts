/**
 * This class represents a sorting mechanism that can use an arbitrary sort
 * order. Its main purpose is to alphabetize the output of Lexifer.
 */
class ArbSorter {
    private readonly splitter: RegExp;
    private readonly ords: { [key: string]: number };
    private readonly vals: string[];

    /**
     * Create a new `ArbSorter`.
     * @param order The list of all graphs used, in the order they are to be
     * sorted, separated by whitespace.
     */
    constructor(order: string) {
        const graphs = order.split(/\s+/gu);
        const splitOrder = [...graphs].sort((a, b) => b.length - a.length);
        this.splitter = new RegExp(`(${splitOrder.join('|')}|.)`, 'gu');

        this.ords = {};
        this.vals = [];

        for (const i in graphs) {
            this.ords[graphs[i]!] = +i;
            this.vals.push(graphs[i]!);
        }
    }

    // Convert a word to an array of numbers, for better sorting
    private wordAsValues(word: string) {
        const splitWord = this.split(word);
        const arrayedWord = splitWord.map(char => this.ords[char]);
        if (arrayedWord.includes(undefined)) {
            throw new Error(`word with unknown letter: '${word}'.\n`
                + 'A filter or assimilation might have caused this.');
        }

        return <number[]>arrayedWord;
    }

    // Convert the array of numbers back to a word
    private valuesAsWord(values: number[]) {
        return values.map(el => this.vals[el])
            .join('');
    }

    /**
     * Split a word into its graphs.
     * @param word The word to be split.
     * @returns An array of short strings, each one representing a single
     * grapheme or multigraph.
     */
    split(word: string) {
        return word.split(this.splitter)
            .filter((_, i) => i % 2);
    }

    /**
     * Sort a list of words.
     * @param list The list of words to be sorted.
     * @returns A sorted copy of the list.
     */
    sort(list: string[]) {
        const l2 = list.filter(el => el !== '').map(this.wordAsValues);
        l2.sort((a, b) => a[0]! - b[0]!);

        return l2.map(this.valuesAsWord);
    }
}

export default ArbSorter;
