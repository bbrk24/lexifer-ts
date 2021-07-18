import { textify, SoundSystem } from './wordgen';

class UnknownOption extends Error { }
class ParseError extends Error { }

class PhonologyDefinition {
    private macros: [RegExp, string][] = [];
    private letters: string[] = [];
    private phClasses: string[] = [];

    // a bit of a hack since JS can't read files directly
    private defFileLineNum = 0;
    private defFileArr: string[];

    soundsys: SoundSystem;

    constructor(soundsys: SoundSystem, defFile: string) {
        this.soundsys = soundsys;
        this.defFileArr = defFile.split('\n');
        this.parse();
        this.sanityCheck();
    }

    private parse() {
        for (; this.defFileLineNum < this.defFileArr.length; ++this.defFileLineNum) {
            let line = this.defFileArr[this.defFileLineNum]!;

            line = line.replace(/#.*/, '').trim();
            if (line === '') {
                continue;
            }

            if (line.startsWith('with:')) {
                this.parseOption(line.substring(5).trim());
            } else if (line.startsWith('random-rate:')) {
                this.soundsys.randpercent = parseInt(line.substring(12));
            } else if (line.startsWith('filter:')) {
                this.parseFilter(line.substring(7).trim());
            } else if (line.startsWith('reject:')) {
                this.parseReject(line.substring(7).trim());
            } else if (line.startsWith('words:')) {
                this.parseWords(line.substring(6).trim());
            } else if (line.startsWith('letters:')) {
                this.parseLetters(line.substring(8).trim());
            } else if (line[0] === '%') {
                this.parseClusterfield();
            } else if (line.includes('=')) {
                this.parseClass(line);
            } else {
                throw new ParseError(line);
            }
        }
        if ((this.soundsys.useAssim || this.soundsys.useCoronalMetathesis) && !this.soundsys.sorter) {
            console.error('Without \'letters:\' cannot apply assimilations or coronal metathesis.')
        }
    }

    private sanityCheck() {
        if (this.letters.length) {
            let letters = new Set(this.letters);
            let phonemes = new Set(this.phClasses);
            if (phonemes.size > letters.size) {
                let diff = [...phonemes].filter(el => !letters.has(el));
                console.error(`A phoneme class contains '${diff.join(' ')}'`
                    + 'missing from \'letters\'.  Strange word shapes are '
                    + 'likely to result.')
            }
        }
    }

    private parseOption(line: string) {
        for (let option of line.split(/\s+/g)) {
            switch (option) {
                case 'std-ipa-features':
                    this.soundsys.useIpa();
                    break;
                case 'std-digraph-features':
                    this.soundsys.useDigraphs();
                    break;
                case 'std-assimilations':
                    this.soundsys.withStdAssimilations();
                    break;
                case 'coronal-metathesis':
                    this.soundsys.withCoronalMetathesis();
                    break;
                default:
                    throw new UnknownOption(option);
            }
        }
    }

    private parseFilter(line: string) {
        for (let filt of line.split(';')) {
            filt = filt.trim();
            if (filt === '') {
                continue;
            }

            let [pre, post] = filt.split('>');
            this.addFilter(pre!, post!);
        }
    }

    private addFilter(pre: string, post: string) {
        pre = pre.trim();
        post = post.trim();
        this.soundsys.addFilter(new RegExp(pre, 'g'), post);
    }

    private parseReject(line: string) {
        for (let filt of line.split(/\s+/g)) {
            this.soundsys.addFilter(new RegExp(filt, 'g'), 'REJECT');
        }
    }

    private parseWords(line: string) {
        line = this.expandMacros(line);
        let splitLine = line.split(/\s+/g);
        for (let i = 0; i < splitLine.length; ++i) {
            this.soundsys.addRule(splitLine[i]!, 10.0 / Math.pow((i + 1), 0.9))
        }
    }

    private expandMacros(word: string) {
        for (let [macro, value] of this.macros) {
            word = word.replaceAll(macro, value);
        }
        return word;
    }

    private parseLetters(line: string) {
        this.letters = line.split(/\s+/g);
        this.soundsys.addSortOrder(line);
    }

    private parseClusterfield() {
        let c2list = this.defFileArr[this.defFileLineNum]!
            .split(/\s+/g);
        c2list.shift();
        let n = c2list.length;

        while (!['', '\n'].includes(this.defFileArr[this.defFileLineNum]!)) {
            ++this.defFileLineNum;

            let line = this.defFileArr[this.defFileLineNum]!;
            line = line.replace(/#.*/, '').trim();
            if (line === '') {
                continue;
            }

            let row = line.split(/\s+/g);
            let c1 = row.splice(0, 1);

            if (row.length === n) {
                for (let i = 0; i < n; ++i) {
                    if (row[i] === '+') {
                        continue;
                    } else if (row[i] === '-') {
                        this.soundsys.addFilter(
                            new RegExp(c1 + c2list[i]!, 'g'),
                            'REJECT'
                        );
                    } else {
                        this.soundsys.addFilter(
                            new RegExp(c1 + c2list[i]!, 'g'),
                            row[i]!
                        );
                    }
                }
            } else if (row.length > n) {
                throw new ParseError(`Cluster field row too long: ${line}`);
            } else {
                throw new ParseError(`Cluster field row too short: ${line}`);
            }
        }
    }

    private parseClass(line: string) {
        let [sclass, values] = line.split('=');
        sclass = sclass!.trim();
        values = values!.trim();
        if (sclass[0] === '$') {
            this.macros.push([
                new RegExp(`\\${sclass}`, 'g'),
                values
            ]);
        } else {
            this.phClasses.concat(values.split(/\s+/g));
            this.soundsys.addPhUnit(sclass, values);
        }
    }

    generate(n = 1, unsorted = false) {
        return this.soundsys.generate(n, unsorted);
    }

    paragraph(sentences?: number) {
        return textify(this.soundsys, sentences);
    }
}

export default PhonologyDefinition;