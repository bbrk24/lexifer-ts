const data: [string, string, string, string, string][] = [
    // Bilabial, labio-dental
    ['p', 'p', 'voiceless', 'bilabial', 'stop'],
    ['b', 'b', 'voiced', 'bilabial', 'stop'],
    ['ɸ', 'ph', 'voiceless', 'bilabial', 'fricative'],
    ['β', 'bh', 'voiced', 'bilabial', 'fricative'],
    ['f', 'f', 'voiceless', 'labiodental', 'fricative'],
    ['v', 'v', 'voiced', 'labiodental', 'fricative'],
    ['m', 'm', 'voiced', 'bilabial', 'nasal'],
    ['m', 'm', 'voiced', 'labiodental', 'nasal'],
    // Alveolar
    ['t', 't', 'voiceless', 'alveolar', 'stop'],
    ['d', 'd', 'voiced', 'alveolar', 'stop'],
    ['s', 's', 'voiceless', 'alveolar', 'sibilant'],
    ['z', 'z', 'voiced', 'alveolar', 'sibilant'],
    ['θ', 'th', 'voiceless', 'alveolar', 'fricative'],
    ['ð', 'dh', 'voiced', 'alveolar', 'fricative'],
    ['ɬ', 'lh', 'voiceless', 'alveolar', 'lateral fricative'],
    ['ɮ', 'ldh', 'voiced', 'alveolar', 'lateral fricative'],
    ['tɬ', 'tl', 'voiceless', 'alveolar', 'lateral affricate'],
    ['dɮ', 'dl', 'voiced', 'alveolar', 'lateral affricate'],
    ['ts', 'ts', 'voiceless', 'alveolar', 'affricate'],
    ['dz', 'dz', 'voiced', 'alveolar', 'affricate'],
    ['ʃ', 'sh', 'voiceless', 'postalveolar', 'sibilant'],
    ['ʒ', 'zh', 'voiced', 'postalveolar', 'sibilant'],
    ['tʃ', 'ch', 'voiceless', 'postalveolar', 'affricate'],
    ['dʒ', 'j', 'voiced', 'postalveolar', 'affricate'],
    ['n', 'n', 'voiced', 'alveolar', 'nasal'],
    // Retroflex
    ['ʈ', 'rt', 'voiceless', 'retroflex', 'stop'],
    ['ɖ', 'rd', 'voiced', 'retroflex', 'stop'],
    ['ʂ', 'sr', 'voiceless', 'retroflex', 'sibilant'],
    ['ʐ', 'zr', 'voiced', 'retroflex', 'sibilant'],
    ['ʈʂ', 'rts', 'voiceless', 'retroflex', 'affricate'],
    ['ɖʐ', 'rdz', 'voiced', 'retroflex', 'affricate'],
    ['ɳ', 'rn', 'voiced', 'retroflex', 'nasal'],
    // Palatal
    ['c', 'ky', 'voiceless', 'palatal', 'stop'],
    ['ɟ', 'gy', 'voiced', 'palatal', 'stop'],
    ['ɕ', 'sy', 'voiceless', 'palatal', 'sibilant'],
    ['ʑ', 'zy', 'voiced', 'palatal', 'sibilant'],
    ['ç', 'hy', 'voiceless', 'palatal', 'fricative'],
    ['ʝ', 'yy', 'voiced', 'palatal', 'fricative'],
    ['tɕ', 'cy', 'voiceless', 'palatal', 'affricate'],
    ['dʑ', 'jy', 'voiced', 'palatal', 'affricate'],
    ['ɲ', 'ny', 'voiced', 'palatal', 'nasal'],
    // Velar
    ['k', 'k', 'voiceless', 'velar', 'stop'],
    ['g', 'g', 'voiced', 'velar', 'stop'],
    ['x', 'kh', 'voiceless', 'velar', 'fricative'],
    ['ɣ', 'gh', 'voiced', 'velar', 'fricative'],
    ['ŋ', 'ng', 'voiced', 'velar', 'nasal'],
    // Uvular
    ['q', 'q', 'voiceless', 'uvular', 'stop'],
    ['ɢ', 'gq', 'voiced', 'uvular', 'stop'],
    ['χ', 'qh', 'voiceless', 'uvular', 'fricative'],
    ['ʁ', 'gqh', 'voiced', 'uvular', 'fricative'],
    ['ɴ', 'nq', 'voiced', 'uvular', 'nasal']
];

let phdb: [string, string, string, string][] = [];

const initialize = (notation = 'ipa') => {
    if (notation === 'ipa') {
        for (let row of data) {
            phdb.push([row[0], row[2], row[3], row[4]]);
        }
    } else if (notation === 'digraph') {
        for (let row of data) {
            phdb.push([row[1], row[2], row[3], row[4]]);
        }
    } else {
        throw new Error(`Unknown notation: ${notation}`);
    }
};

const nasalAssimilate = (ph1: string, ph2: string) => {
    let data1 = phdb.filter(el => el[0] === ph1)[0];
    if (data1 && data1[3] === 'nasal') {
        let data2 = phdb.filter(el => el[0] === ph2)[0];
        if (data2) {
            let result = phdb.filter(el =>
                el[2] === data2![2] && el[3] === 'nasal'
            )[0];
            if (result && result[0]) {
                return result[0];
            }
        }
    }
    return ph1;
};

const voiceAssimilate = (ph1: string, ph2: string) => {
    let data2 = phdb.filter(el => el[0] === ph2)[0];
    if (data2 && data2[3] !== 'nasal') {
        let data1 = phdb.filter(el => el[0] === ph1)[0];
        if (data1) {
            let result = phdb.filter(el =>
                el[1] === data2![1]
                && el[2] === data1![2]
                && el[3] === data1![3]
            )[0];
            if (result && result[0]) {
                return result[0];
            }
        }
    }
    return ph1;
};

const coronalMetathesis = (ph1: string, ph2: string): [string, string] => {
    let data1 = phdb.filter(el => el[0] === ph1)[0];
    if (data1 && data1[2] === 'alveolar') {
        let data2 = phdb.filter(el => el[0] === ph2)[0];
        if (
            data2
            && ['velar', 'bilabial'].includes(data2[2])
            && ['stop', 'nasal'].includes(data2[3])
            && data2[3] === data1[3]
        ) {
            return [ph2, ph1];
        }
    }
    return [ph1, ph2];
};

const applyAssimilations = (word: string[]) => {
    let newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        newArr[i] = voiceAssimilate(word[i]!, word[i + 1]!);
        newArr[i] = nasalAssimilate(newArr[i]!, word[i + 1]!); // sic
    }
    return newArr;
};

const applyCoronalMetathesis = (word: string[]) => {
    let newArr = [...word];
    for (let i = 0; i < word.length - 1; ++i) {
        [newArr[i], newArr[i + 1]] = coronalMetathesis(word[i]!, word[i + 1]!);
    }
    return newArr;
};
