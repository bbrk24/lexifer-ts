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

enum Place {
    Bilabial,
    Labiodental,
    Alveolar,
    Postalveolar,
    Retroflex,
    Palatal,
    Velar,
    Uvular
}

enum Manner {
    Plosive,
    Fricative,
    Nasal,
    Sibilant,
    LateralFricative,
    LateralAffricate,
    Affricate
}

/**
 * This class represents a single consonant phone, including features and
 * notations.
 */
class Segment {
    /**
     * Create a new segment with the given features.
     * @param representation The string representation of the segment.
     * @param voiced `true` iff the segment is voiced.
     * @param place The place of articulation of the consonant.
     * @param manner The manner of articulation of the consonant.
     */
    constructor(
        readonly representation: string,
        readonly voiced: boolean,
        readonly place: Place,
        readonly manner: Manner
    ) {
    }

    /** `true` iff the phoneme is a plosive or nasal. */
    get isStop() {
        return this.manner === Manner.Nasal || this.manner === Manner.Plosive;
    }

    /** `true` iff the phoneme is bilabial or velar. */
    get isPeripheral() {
        return this.place === Place.Bilabial || this.place === Place.Velar;
    }

    toString() {
        return this.representation;
    }
}

interface SegmentFeatures {
    voiced?: boolean;
    place?: Place;
    manner?: Manner;
}

class ClusterEngine {
    /**
     * The list of all recognized consonant segments. This is an array for a
     * reason: in order for the labial-and-labiodental phonemes to work
     * properly, this must be ordered.
     */
    private readonly segments: readonly Segment[];

    /**
     * Initialize the cluster engine.
     * @param isIpa Whether the current featureset is IPA.
     */
    constructor(isIpa: boolean) {
        this.segments = [
            // Bilabial, labio-dental
            new Segment(
                'p',
                false,
                Place.Bilabial,
                Manner.Plosive
            ),
            new Segment(
                'b',
                true,
                Place.Bilabial,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'ph',
                false,
                Place.Bilabial,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'bh',
                true,
                Place.Bilabial,
                Manner.Fricative
            ),
            new Segment(
                'f',
                false,
                Place.Labiodental,
                Manner.Fricative
            ),
            new Segment(
                'v',
                true,
                Place.Labiodental,
                Manner.Fricative
            ),
            new Segment(
                'm',
                true,
                Place.Bilabial,
                Manner.Nasal
            ),
            new Segment(
                'm',
                true,
                Place.Labiodental,
                Manner.Nasal
            ),
            // Alveolar
            new Segment(
                't',
                false,
                Place.Alveolar,
                Manner.Plosive
            ),
            new Segment(
                'd',
                true,
                Place.Alveolar,
                Manner.Plosive
            ),
            new Segment(
                's',
                false,
                Place.Alveolar,
                Manner.Sibilant
            ),
            new Segment(
                'z',
                true,
                Place.Alveolar,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? '??' : 'th',
                false,
                Place.Alveolar,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'dh',
                true,
                Place.Alveolar,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'lh',
                false,
                Place.Alveolar,
                Manner.LateralFricative
            ),
            new Segment(
                isIpa ? '??' : 'ldh',
                true,
                Place.Alveolar,
                Manner.LateralFricative
            ),
            new Segment(
                isIpa ? 't??' : 'tl',
                false,
                Place.Alveolar,
                Manner.LateralAffricate
            ),
            new Segment(
                isIpa ? 'd??' : 'dl',
                true,
                Place.Alveolar,
                Manner.LateralAffricate
            ),
            new Segment(
                'ts',
                false,
                Place.Alveolar,
                Manner.Affricate
            ),
            new Segment(
                'dz',
                true,
                Place.Alveolar,
                Manner.Affricate
            ),
            new Segment(
                isIpa ? '??' : 'sh',
                false,
                Place.Postalveolar,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? '??' : 'zh',
                true,
                Place.Postalveolar,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? 't??' : 'ch',
                false,
                Place.Postalveolar,
                Manner.Affricate
            ),
            new Segment(
                isIpa ? 'd??' : 'j',
                true,
                Place.Postalveolar,
                Manner.Affricate
            ),
            new Segment(
                'n',
                true,
                Place.Alveolar,
                Manner.Nasal
            ),
            // Retroflex
            new Segment(
                isIpa ? '??' : 'rt',
                false,
                Place.Retroflex,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'rd',
                true,
                Place.Retroflex,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'sr',
                false,
                Place.Retroflex,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? '??' : 'zr',
                true,
                Place.Retroflex,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? '????' : 'rts',
                false,
                Place.Retroflex,
                Manner.Affricate
            ),
            new Segment(
                isIpa ? '????' : 'rdz',
                true,
                Place.Retroflex,
                Manner.Affricate
            ),
            new Segment(
                isIpa ? '??' : 'rn',
                true,
                Place.Retroflex,
                Manner.Nasal
            ),
            // Palatal
            new Segment(
                isIpa ? 'c' : 'ky',
                false,
                Place.Palatal,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'gy',
                true,
                Place.Palatal,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'sy',
                false,
                Place.Palatal,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? '??' : 'zy',
                true,
                Place.Palatal,
                Manner.Sibilant
            ),
            new Segment(
                isIpa ? '??' : 'hy',
                false,
                Place.Palatal,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'yy',
                true,
                Place.Palatal,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? 't??' : 'cy',
                false,
                Place.Palatal,
                Manner.Affricate
            ),
            new Segment(
                isIpa ? 'd??' : 'jy',
                true,
                Place.Palatal,
                Manner.Affricate
            ),
            new Segment(
                isIpa ? '??' : 'ny',
                true,
                Place.Palatal,
                Manner.Nasal
            ),
            // Velar
            new Segment(
                'k',
                false,
                Place.Velar,
                Manner.Plosive
            ),
            new Segment(
                'g',
                true,
                Place.Velar,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? 'x' : 'kh',
                false,
                Place.Velar,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'gh',
                true,
                Place.Velar,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'ng',
                true,
                Place.Velar,
                Manner.Nasal
            ),
            // Uvular
            new Segment(
                'q',
                false,
                Place.Uvular,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'gq',
                true,
                Place.Uvular,
                Manner.Plosive
            ),
            new Segment(
                isIpa ? '??' : 'qh',
                false,
                Place.Uvular,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'gqh',
                true,
                Place.Uvular,
                Manner.Fricative
            ),
            new Segment(
                isIpa ? '??' : 'nq',
                true,
                Place.Uvular,
                Manner.Nasal
            )
        ];
    }

    getSegment(features: Readonly<SegmentFeatures>) {
        return this.segments.find(el =>
            (features.voiced === undefined || el.voiced === features.voiced)
            && (features.place === undefined || el.place === features.place)
            && (features.manner === undefined
                || el.manner === features.manner));
    }

    /**
     * Apply `std-assimilations` to a word.
     * @param word The word, as an array of graphs.
     * @returns A copy of the word that has assimilations applied to it.
     * @example
     * let origWord = ['a', 'n', 'p', 'a'];
     * let newWord = ce.applyAssimilations(origWord);
     * // newWord = ['a', 'm', 'p', 'a']
     */
    applyAssimilations(word: readonly string[]) {
        const nasalAssimilate = (ph1: string, ph2: string) => {
            const data1 = this.segments.find(el =>
                el.representation === ph1);

            if (data1 && data1.manner === Manner.Nasal) {
                const data2 = this.segments.find(el =>
                    el.representation === ph2);

                if (data2) {
                    const result = this.segments.find(el =>
                        el.place === data2!.place
                        && el.manner === Manner.Nasal);

                    if (result) {
                        return result.representation;
                    }
                }
            }

            return ph1;
        };

        const voiceAssimilate = (ph1: string, ph2: string) => {
            const data2 = this.segments.find(el =>
                el.representation === ph2);

            if (data2) {
                const data1 = this.segments.find(el =>
                    el.representation === ph1);

                if (data1) {
                    const result = this.segments.find(el =>
                        el.voiced === data2.voiced
                        && el.place === data1.place
                        && el.manner === data1.manner);

                    if (result) {
                        return result.representation;
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
     * @example
     * let origWord = ['a', 't', 'p', 'a'];
     * let newWord = ce.applyCoronalMetathesis(origWord);
     * // newWord = ['a', 'p', 't', 'a']
     */
    applyCoronalMetathesis(word: readonly string[]) {
        const coronalMetathesis = (
            ph1: string,
            ph2: string
        ): [string, string] => {
            const data1 = this.segments.find(el =>
                el.representation === ph1);

            if (data1 && data1.place === Place.Alveolar) {
                const data2 = this.segments.find(el =>
                    el.representation === ph2);

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
                newArr[i]!,
                word[i + 1]!
            );
        }

        return newArr;
    }
}

export { ClusterEngine, Segment, Place, Manner };
