/*
 * Copyright (c) 2021 William Baker
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

const enum Voicing {
    Voiceless, Voiced
}

const enum Place {
    Bilabial,
    Labiodental,
    Alveolar,
    Postalveolar,
    Retroflex,
    Palatal,
    Velar,
    Uvular
}

const enum Manner {
    Stop,
    Fricative,
    Nasal,
    Sibilant,
    // LateralFricative and LateralAffricate are too long
    // they don't let the data array items fit in 80 chars when indented
    LatFric,
    LatAffric,
    Affricate
}

const data: [string, string, Voicing, Place, Manner][] = [
    // Bilabial, labio-dental
    ['p',  'p',   Voicing.Voiceless, Place.Bilabial,     Manner.Stop],
    ['b',  'b',   Voicing.Voiced,    Place.Bilabial,     Manner.Stop],
    ['ɸ',  'ph',  Voicing.Voiceless, Place.Bilabial,     Manner.Fricative],
    ['β',  'bh',  Voicing.Voiced,    Place.Bilabial,     Manner.Fricative],
    ['f',  'f',   Voicing.Voiceless, Place.Labiodental,  Manner.Fricative],
    ['v',  'v',   Voicing.Voiced,    Place.Labiodental,  Manner.Fricative],
    ['m',  'm',   Voicing.Voiced,    Place.Bilabial,     Manner.Nasal],
    ['m',  'm',   Voicing.Voiced,    Place.Labiodental,  Manner.Nasal],
    // Alveolar
    ['t',  't',   Voicing.Voiceless, Place.Alveolar,     Manner.Stop],
    ['d',  'd',   Voicing.Voiced,    Place.Alveolar,     Manner.Stop],
    ['s',  's',   Voicing.Voiceless, Place.Alveolar,     Manner.Sibilant],
    ['z',  'z',   Voicing.Voiced,    Place.Alveolar,     Manner.Sibilant],
    ['θ',  'th',  Voicing.Voiceless, Place.Alveolar,     Manner.Fricative],
    ['ð',  'dh',  Voicing.Voiced,    Place.Alveolar,     Manner.Fricative],
    ['ɬ',  'lh',  Voicing.Voiceless, Place.Alveolar,     Manner.LatFric],
    ['ɮ',  'ldh', Voicing.Voiced,    Place.Alveolar,     Manner.LatFric],
    ['tɬ', 'tl',  Voicing.Voiceless, Place.Alveolar,     Manner.LatAffric],
    ['dɮ', 'dl',  Voicing.Voiced,    Place.Alveolar,     Manner.LatAffric],
    ['ts', 'ts',  Voicing.Voiceless, Place.Alveolar,     Manner.Affricate],
    ['dz', 'dz',  Voicing.Voiced,    Place.Alveolar,     Manner.Affricate],
    ['ʃ',  'sh',  Voicing.Voiceless, Place.Postalveolar, Manner.Sibilant],
    ['ʒ',  'zh',  Voicing.Voiced,    Place.Postalveolar, Manner.Sibilant],
    ['tʃ', 'ch',  Voicing.Voiceless, Place.Postalveolar, Manner.Affricate],
    ['dʒ', 'j',   Voicing.Voiced,    Place.Postalveolar, Manner.Affricate],
    ['n',  'n',   Voicing.Voiced,    Place.Alveolar,     Manner.Nasal],
    // Retroflex
    ['ʈ',  'rt',  Voicing.Voiceless, Place.Retroflex,    Manner.Stop],
    ['ɖ',  'rd',  Voicing.Voiced,    Place.Retroflex,    Manner.Stop],
    ['ʂ',  'sr',  Voicing.Voiceless, Place.Retroflex,    Manner.Sibilant],
    ['ʐ',  'zr',  Voicing.Voiced,    Place.Retroflex,    Manner.Sibilant],
    ['ʈʂ', 'rts', Voicing.Voiceless, Place.Retroflex,    Manner.Affricate],
    ['ɖʐ', 'rdz', Voicing.Voiced,    Place.Retroflex,    Manner.Affricate],
    ['ɳ',  'rn',  Voicing.Voiced,    Place.Retroflex,    Manner.Nasal],
    // Palatal
    ['c',  'ky',  Voicing.Voiceless, Place.Palatal,      Manner.Stop],
    ['ɟ',  'gy',  Voicing.Voiced,    Place.Palatal,      Manner.Stop],
    ['ɕ',  'sy',  Voicing.Voiceless, Place.Palatal,      Manner.Sibilant],
    ['ʑ',  'zy',  Voicing.Voiced,    Place.Palatal,      Manner.Sibilant],
    ['ç',  'hy',  Voicing.Voiceless, Place.Palatal,      Manner.Fricative],
    ['ʝ',  'yy',  Voicing.Voiced,    Place.Palatal,      Manner.Fricative],
    ['tɕ', 'cy',  Voicing.Voiceless, Place.Palatal,      Manner.Affricate],
    ['dʑ', 'jy',  Voicing.Voiced,    Place.Palatal,      Manner.Affricate],
    ['ɲ',  'ny',  Voicing.Voiced,    Place.Palatal,      Manner.Nasal],
    // Velar
    ['k',  'k',   Voicing.Voiceless, Place.Velar,        Manner.Stop],
    ['g',  'g',   Voicing.Voiced,    Place.Velar,        Manner.Stop],
    ['x',  'kh',  Voicing.Voiceless, Place.Velar,        Manner.Fricative],
    ['ɣ',  'gh',  Voicing.Voiced,    Place.Velar,        Manner.Fricative],
    ['ŋ',  'ng',  Voicing.Voiced,    Place.Velar,        Manner.Nasal],
    // Uvular
    ['q',  'q',   Voicing.Voiceless, Place.Uvular,       Manner.Stop],
    ['ɢ',  'gq',  Voicing.Voiced,    Place.Uvular,       Manner.Stop],
    ['χ',  'qh',  Voicing.Voiceless, Place.Uvular,       Manner.Fricative],
    ['ʁ',  'gqh', Voicing.Voiced,    Place.Uvular,       Manner.Fricative],
    ['ɴ',  'nq',  Voicing.Voiced,    Place.Uvular,       Manner.Nasal]
];

let phdb: [string, Voicing, Place, Manner][] = [];

const initialize = (isIpa: boolean = true) => {
    if (isIpa) {
        for (let row of data) {
            phdb.push([row[0], row[2], row[3], row[4]]);
        }
    } else {
        for (let row of data) {
            phdb.push([row[1], row[2], row[3], row[4]]);
        }
    }
};

const applyAssimilations = (word: string[]) => {
    const nasalAssimilate = (ph1: string, ph2: string) => {
        let data1 = phdb.find(el => el[0] === ph1);
        if (data1 && data1[3] === Manner.Nasal) {
            let data2 = phdb.find(el => el[0] === ph2);
            if (data2) {
                let result = phdb.find(el =>
                    el[2] === data2![2] && el[3] === Manner.Nasal
                );
                if (result) {
                    return result[0];
                }
            }
        }
        return ph1;
    };
    
    const voiceAssimilate = (ph1: string, ph2: string) => {
        let data2 = phdb.find(el => el[0] === ph2);
        if (data2 && data2[3] !== Manner.Nasal) {
            let data1 = phdb.find(el => el[0] === ph1);
            if (data1) {
                let result = phdb.find(el =>
                    el[1] === data2![1]
                    && el[2] === data1![2]
                    && el[3] === data1![3]
                );
                if (result) {
                    return result[0];
                }
            }
        }
        return ph1;
    };
    
    let newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        newArr[i] = voiceAssimilate(word[i]!, word[i + 1]!);
        newArr[i] = nasalAssimilate(newArr[i]!, word[i + 1]!); // sic
    }
    return newArr;
};

const applyCoronalMetathesis = (word: string[]) => {
    const coronalMetathesis = (ph1: string, ph2: string): [string, string] => {
        let data1 = phdb.filter(el => el[0] === ph1)[0];
        if (data1 && data1[2] === Place.Alveolar) {
            let data2 = phdb.filter(el => el[0] === ph2)[0];
            if (
                data2
                && [Place.Velar, Place.Bilabial].includes(data2[2])
                && [Manner.Stop, Manner.Nasal].includes(data2[3])
                && data2[3] === data1[3]
            ) {
                return [ph2, ph1];
            }
        }
        return [ph1, ph2];
    };
    
    let newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        [newArr[i], newArr[i + 1]] = coronalMetathesis(word[i]!, word[i + 1]!);
    }
    return newArr;
};

export { initialize, applyAssimilations, applyCoronalMetathesis };
