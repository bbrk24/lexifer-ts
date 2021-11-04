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

const enum Place {
    Bilabial,
    Labiodental,
    Alveolar,
    PostAlv,
    Retroflex,
    Palatal,
    Velar,
    Uvular
}

const enum Manner {
    Plosive,
    Fricative,
    Nasal,
    Sibilant,
    // `LateralFricative` and `LateralAffricate` are too long -- they don't let
    // the data array items fit in 80 chars when indented.
    LatFric,
    LatAffric,
    Affricate,
    Approx,
    LatApprox,
    Trill
}

/**
 * This class represents a single consonant phone, including features and
 * notations.
 */
class Segment {
    static index: 'digraph' | 'ipa';

    /** The IPA representation of the consonant. */
    readonly ipa: string;
    /** An ASCII representation of the consonant. */
    readonly digraph: string;
    /** Whether or not the consonant is voiced. */
    readonly voiced: boolean;
    /** The place of articulation of the consonant. */
    readonly place: Place;
    /** The manner of articulation of the consonant. */
    readonly manner: Manner;

    /**
     * Create a new Segment.
     * @param arr The properties of the segment -- `ipa`, `digraph`, `voiced`,
     * `place`, and `manner` respectively.
     */
    constructor(arr: readonly [string, string, boolean, Place, Manner]) {
        [this.ipa, this.digraph, this.voiced, this.place, this.manner] = arr;
    }

    /** `true` iff the phoneme is a plosive or nasal. */
    get isStop() {
        return this.manner === Manner.Nasal || this.manner === Manner.Plosive;
    }

    /** `true` iff the phoneme is bilabial or velar. */
    get isPeripheral() {
        return this.place === Place.Bilabial || this.place === Place.Velar;
    }

    /**
     * `true` iff the phoneme is an approximant, lateral approximant, or trill.
     */
    get isApprox() {
        return this.manner === Manner.Approx
            || this.manner === Manner.LatApprox
            || this.manner === Manner.Trill;
    }

    /**
     * The string representation of the phoneme under the current featureset.
     */
    toString() {
        return this[Segment.index];
    }
}

class ClusterEngine {
    /*
     * Using a constructor from a tuple might be slower at runtime, but it only
     * runs once, and takes up fewer characters.
     */
    /**
     * The list of all recognized consonant segments. This is an array for a
     * reason: in order for the labial-and-labiodental phonemes to work
     * properly, this must be ordered.
     */
    private static readonly segments = [
        // Bilabial, labio-dental
        new Segment(['p',  'p',   false, Place.Bilabial,    Manner.Plosive]),
        new Segment(['b',  'b',   true,  Place.Bilabial,    Manner.Plosive]),
        new Segment(['ɸ',  'ph',  false, Place.Bilabial,    Manner.Fricative]),
        new Segment(['β',  'bh',  true,  Place.Bilabial,    Manner.Fricative]),
        new Segment(['f',  'f',   false, Place.Labiodental, Manner.Fricative]),
        new Segment(['v',  'v',   true,  Place.Labiodental, Manner.Fricative]),
        new Segment(['m',  'm',   true,  Place.Bilabial,    Manner.Nasal]),
        new Segment(['m',  'm',   true,  Place.Labiodental, Manner.Nasal]),
        new Segment(['ʋ',  'vw',  true,  Place.Bilabial,    Manner.Approx]),
        new Segment(['w',  'w',   true,  Place.Bilabial,    Manner.Approx]),
        new Segment(['w',  'w',   true,  Place.Labiodental, Manner.Approx]),
        // Alveolar
        new Segment(['t',  't',   false, Place.Alveolar,    Manner.Plosive]),
        new Segment(['d',  'd',   true,  Place.Alveolar,    Manner.Plosive]),
        new Segment(['s',  's',   false, Place.Alveolar,    Manner.Sibilant]),
        new Segment(['z',  'z',   true,  Place.Alveolar,    Manner.Sibilant]),
        new Segment(['θ',  'th',  false, Place.Alveolar,    Manner.Fricative]),
        new Segment(['ð',  'dh',  true,  Place.Alveolar,    Manner.Fricative]),
        new Segment(['ɬ',  'lh',  false, Place.Alveolar,    Manner.LatFric]),
        new Segment(['ɮ',  'ldh', true,  Place.Alveolar,    Manner.LatFric]),
        new Segment(['tɬ', 'tl',  false, Place.Alveolar,    Manner.LatAffric]),
        new Segment(['dɮ', 'dl',  true,  Place.Alveolar,    Manner.LatAffric]),
        new Segment(['ts', 'ts',  false, Place.Alveolar,    Manner.Affricate]),
        new Segment(['dz', 'dz',  true,  Place.Alveolar,    Manner.Affricate]),
        new Segment(['ʃ',  'sh',  false, Place.PostAlv,     Manner.Sibilant]),
        new Segment(['ʒ',  'zh',  true,  Place.PostAlv,     Manner.Sibilant]),
        new Segment(['tʃ', 'ch',  false, Place.PostAlv,     Manner.Affricate]),
        new Segment(['dʒ', 'j',   true,  Place.PostAlv,     Manner.Affricate]),
        new Segment(['n',  'n',   true,  Place.Alveolar,    Manner.Nasal]),
        new Segment(['ɹ',  'rh',  true,  Place.Alveolar,    Manner.Approx]),
        new Segment(['l',  'l',   true,  Place.Alveolar,    Manner.LatApprox]),
        new Segment(['r',  'r',   true,  Place.Alveolar,    Manner.Trill]),
        // Retroflex
        new Segment(['ʈ',  'rt',  false, Place.Retroflex,   Manner.Plosive]),
        new Segment(['ɖ',  'rd',  true,  Place.Retroflex,   Manner.Plosive]),
        new Segment(['ʂ',  'sr',  false, Place.Retroflex,   Manner.Sibilant]),
        new Segment(['ʐ',  'zr',  true,  Place.Retroflex,   Manner.Sibilant]),
        new Segment(['ʈʂ', 'rts', false, Place.Retroflex,   Manner.Affricate]),
        new Segment(['ɖʐ', 'rdz', true,  Place.Retroflex,   Manner.Affricate]),
        new Segment(['ɳ',  'rn',  true,  Place.Retroflex,   Manner.Nasal]),
        new Segment(['ɻ',  'rr',  true,  Place.Retroflex,   Manner.Approx]),
        new Segment(['ɭ',  'rl',  true,  Place.Retroflex,   Manner.LatApprox]),
        // Palatal
        new Segment(['c',  'ky',  false, Place.Palatal,     Manner.Plosive]),
        new Segment(['ɟ',  'gy',  true,  Place.Palatal,     Manner.Plosive]),
        new Segment(['ɕ',  'sy',  false, Place.Palatal,     Manner.Sibilant]),
        new Segment(['ʑ',  'zy',  true,  Place.Palatal,     Manner.Sibilant]),
        new Segment(['ç',  'hy',  false, Place.Palatal,     Manner.Fricative]),
        new Segment(['ʝ',  'yy',  true,  Place.Palatal,     Manner.Fricative]),
        new Segment(['tɕ', 'cy',  false, Place.Palatal,     Manner.Affricate]),
        new Segment(['dʑ', 'jy',  true,  Place.Palatal,     Manner.Affricate]),
        new Segment(['ɲ',  'ny',  true,  Place.Palatal,     Manner.Nasal]),
        new Segment(['j',  'y',   true,  Place.Palatal,     Manner.Approx]),
        // Velar
        new Segment(['k',  'k',   false, Place.Velar,       Manner.Plosive]),
        new Segment(['g',  'g',   true,  Place.Velar,       Manner.Plosive]),
        new Segment(['x',  'kh',  false, Place.Velar,       Manner.Fricative]),
        new Segment(['ɣ',  'gh',  true,  Place.Velar,       Manner.Fricative]),
        new Segment(['ŋ',  'ng',  true,  Place.Velar,       Manner.Nasal]),
        new Segment(['ɰ',  'wy',  true,  Place.Velar,       Manner.Approx]),
        // Uvular
        new Segment(['q',  'q',   false, Place.Uvular,      Manner.Plosive]),
        new Segment(['ɢ',  'gq',  true,  Place.Uvular,      Manner.Plosive]),
        new Segment(['χ',  'qh',  false, Place.Uvular,      Manner.Fricative]),
        new Segment(['ʁ',  'gqh', true,  Place.Uvular,      Manner.Fricative]),
        new Segment(['ɴ',  'nq',  true,  Place.Uvular,      Manner.Nasal])
    ];

    /**
     * Initialize the cluster engine.
     * @param isIpa Whether the current featureset is IPA.
     */
    constructor(isIpa: boolean) {
        Segment.index = isIpa ? 'ipa' : 'digraph';
    }

    /**
     * Apply `std-assimilations` to a word.
     * @param word The word, as an array of graphs.
     * @returns A copy of the word that has assimilations applied to it.
     */
    applyAssimilations(word: readonly string[]) {
        const nasalAssimilate = (ph1: string, ph2: string) => {
            const data1 = ClusterEngine.segments.find(el =>
                el.toString() === ph1);

            if (data1 && data1.manner === Manner.Nasal) {
                const data2 = ClusterEngine.segments.find(el =>
                    el.toString() === ph2);

                if (data2 && !data2.isApprox) {
                    const result = ClusterEngine.segments.find(el =>
                        el.place === data2!.place
                        && el.manner === Manner.Nasal);

                    if (result) {
                        return result.toString();
                    }
                }
            }

            return ph1;
        };

        const voiceAssimilate = (ph1: string, ph2: string) => {
            const data2 = ClusterEngine.segments.find(el =>
                el.toString() === ph2);

            if (data2 && !data2.isApprox) {
                const data1 = ClusterEngine.segments.find(el =>
                    el.toString() === ph1);

                if (data1) {
                    const result = ClusterEngine.segments.find(el =>
                        el.voiced === data2!.voiced
                        && el.place === data1!.place
                        && el.manner === data1!.manner);

                    if (result) {
                        return result.toString();
                    }
                }
            }

            return ph1;
        };

        const newArr = [...word];

        for (let i = 0; i < word.length - 1; ++i) {
            newArr[i] = voiceAssimilate(word[i]!, word[i + 1]!);
            newArr[i] = nasalAssimilate(newArr[i]!, word[i + 1]!);
        }

        return newArr;
    }

    /**
     * Apply `coronal-metathesis` to a word.
     * @param word The word, as an array of graphs.
     * @returns A copy of the word that has coronal metathesis applied to it.
     */
    applyCoronalMetathesis(word: readonly string[]) {
        const coronalMetathesis = (
            ph1: string,
            ph2: string
        ): [string, string] => {
            const data1 = ClusterEngine.segments.find(el =>
                el.toString() === ph1);

            if (data1 && data1.place === Place.Alveolar) {
                const data2 = ClusterEngine.segments.find(el =>
                    el.toString() === ph2);

                if (
                    data2?.isPeripheral
                    && data2.isStop
                    && data2.manner === data1.manner
                ) {
                    return [ph2, ph1];
                }
            }

            return [ph1, ph2];
        };

        const newArr = [...word];

        for (let i = 0; i < word.length - 1; ++i) {
            [newArr[i], newArr[i + 1]] = coronalMetathesis(
                word[i]!,
                word[i + 1]!
            );
        }

        return newArr;
    }

    /**
     * Apply `std-rejections` to a word.
     * @param word The word, as an array of graphs.
     * @returns Either the original word, or `['REJECT']`.
     */
    applyRejections(word: readonly string[]) {
        const rejectCluster = (ph1: string, ph2: string) => {
            const data1 = ClusterEngine.segments.find(
                el => el.toString() === ph1
            );

            if (data1 && data1.manner !== Manner.Sibilant) {
                const data2 = ClusterEngine.segments.find(
                    el => el.toString() === ph2
                );

                if (
                    data2?.isApprox
                    && data1.manner !== Manner.Trill
                    && data2.place === data1.place
                ) {
                    // Trills are allowed a bit more generously
                    if (data2.manner === Manner.Trill) {
                        return data1.isApprox
                            || data1.manner === Manner.Nasal;
                    }

                    // Allow /ll/ etc
                    return data1 !== data2;
                }
            }

            return false;
        };

        // Only apply rejections word-initially.
        if (rejectCluster(word[0]!, word[1]!)) {
            return ['REJECT'];
        }

        return word;
    }
}

export { ClusterEngine, Segment };
