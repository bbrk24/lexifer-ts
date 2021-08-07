import { SoundSystem, textify, invalidItemAndWeight } from './wordgen';

class PhonologyDefinition {
    private macros: [RegExp, string][] = [];
    private letters: string[] = [];
    private phClasses: string[] = [];
    private categories: string[] = [];
    
    private stderr: (inp: string | Error) => void;
    
    // a bit of a hack since JS can't read files directly
    private defFileLineNum = 0;
    private defFileArr: string[];
    
    soundsys: SoundSystem;
    
    constructor(
        soundsys: SoundSystem,
        defFile: string,
        stderr: (inp: string | Error) => void
    ) {
        if (defFile.trim() === '') {
            throw new Error('Please include a definition.');
        }
        
        this.soundsys = soundsys;
        this.defFileArr = defFile.split('\n');
        this.stderr = stderr;
        this.parse();
        this.sanityCheck();
    }
    
    private parse() {
        for (;
            this.defFileLineNum < this.defFileArr.length;
            ++this.defFileLineNum
        ) {
            let line = this.defFileArr[this.defFileLineNum]!;
            
            line = line.replace(/#.*/u, '').trim();
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
            } else if (line.startsWith('categories:')) {
                this.parseCategories(line.substring(11).trim());
            } else if (line[0] === '%') {
                this.parseClusterfield();
            } else if (line.includes('=')) {
                this.parseClass(line);
            } else {
                throw new Error(`parsing error at '${line}'.`);
            }
        }
        if ((this.soundsys.useAssim || this.soundsys.useCoronalMetathesis)
            && !this.soundsys.sorter
        ) {
            this.stderr("Without 'letters:' cannot apply assimilations or "
                + 'coronal metathesis.');
        }
    }
    
    private sanityCheck() {
        if (this.letters.length) {
            let letters = new Set(this.letters);
            let phonemes = new Set(this.phClasses);
            if (phonemes.size > letters.size) {
                let diff = [...phonemes].filter(el => !letters.has(el));
                this.stderr(`A phoneme class contains '${diff.join(' ')}' `
                    + "missing from 'letters'.  Strange word shapes are likely"
                    + ' to result.')
            }
        }
    }
    
    private parseOption(line: string) {
        for (let option of line.split(/\s+/gu)) {
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
                    throw new Error(`unknown option '${option}'.`);
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
            this.addFilter(pre!, post);
        }
    }
    
    private addFilter(pre: string, post: string | undefined) {
        if (!post) {
            throw new Error(`malformed filter '${pre}': filters must look like`
                + " 'old > new'.");
        }
        pre = pre.trim();
        post = post.trim();
        this.soundsys.addFilter(pre, post);
    }
    
    private parseReject(line: string) {
        for (let filt of line.split(/\s+/gu)) {
            this.soundsys.addFilter(filt, 'REJECT');
        }
    }
    
    private parseWords(line: string) {
        if (this.categories.length > 0 && this.categories[0] !== 'words:') {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        } else if (this.categories.length === 0) {
            this.soundsys.addCategory('words:', 1);
        }
        this.categories = ['words:'];
        
        this.addRules(line);
    }
    
    private addRules(line: string, cat?: string) {
        let rules = line.split(/\s+/gu);
        let weighted = line.includes(':');
        
        for (let i = 0; i < rules.length; ++i) {
            let rule: string;
            let weight: number;
            
            if (weighted) {
                if (invalidItemAndWeight(rules[i]!)) {
                    throw new Error(`'${rules[i]}' is not a valid pattern and `
                        + 'weight.');
                }
                let weightStr: string;
                [rule, weightStr] = <[string, string]>rules[i]!.split(':');
                weight = +weightStr;
            } else {
                rule = rules[i]!;
                weight = 10.0 / Math.pow((i + 1), 0.9);
            }
            
            rule = this.expandMacros(rule);
            
            this.soundsys.addRule(rule, weight, cat);
        }
    }
    
    private expandMacros(word: string) {
        for (let [macro, value] of this.macros) {
            word = word.replace(macro, value);
        }
        return word;
    }
    
    private parseLetters(line: string) {
        this.letters = line.split(/\s+/gu);
        this.soundsys.addSortOrder(line);
    }
    
    private parseClusterfield() {
        let c2list = this.defFileArr[this.defFileLineNum]!
            .split(/\s+/gu);
        c2list.shift();
        let n = c2list.length;
        
        while (!['', '\n', undefined].includes(
            this.defFileArr[this.defFileLineNum]
        )) {
            let line = this.defFileArr[++this.defFileLineNum] ?? '';
            line = line.replace(/#.*/, '').trim();
            if (line === '') {
                continue;
            }
            
            let row = line.split(/\s+/gu);
            let c1 = row.splice(0, 1);
            
            if (row.length === n) {
                for (let i = 0; i < n; ++i) {
                    if (row[i] === '+') {
                        continue;
                    } else if (row[i] === '-') {
                        this.soundsys.addFilter(c1 + c2list[i]!, 'REJECT');
                    } else {
                        this.soundsys.addFilter(c1 + c2list[i]!, row[i]!);
                    }
                }
            } else if (row.length > n) {
                throw new Error(`cluster field row too long: '${line}'.`);
            } else {
                throw new Error(`cluster field row too short: '${line}'.`);
            }
        }
    }
    
    private parseClass(line: string) {
        let [sclass, values] = <[string, string]>line.split('=');
        sclass = sclass.trim();
        values = values.trim();
        if (sclass[0] === '$') {
            this.macros.push([
                new RegExp(`\\${sclass}`, 'gu'),
                values
            ]);
        } else if (sclass.length === 1) {
            this.phClasses = this.phClasses.concat(values.split(/\s+/gu));
            this.soundsys.addPhUnit(sclass, values);
        } else if (this.categories.includes(sclass)) {
            this.addRules(values, sclass);
        } else {
            throw new Error(`unknown category '${sclass}'. Please put category`
                + " definitions after the 'categories:' statement.");
        }
    }
    
    private parseCategories(line: string) {
        if (this.categories.includes('words:')) {
            throw new Error("both 'words:' and 'categories:' found. Please "
                + 'only use one.');
        }
        
        let splitLine = line.split(/\s+/gu);
        let weighted = line.includes(':');
        
        for (let cat of splitLine) {
            if (weighted) {
                if (invalidItemAndWeight(cat)) {
                    throw new Error(`'${cat}' is not a valid category and `
                        + 'weight.');
                }
                let [name, weight] = <[string, string]>cat.split(':');
                let weightNum = +weight;
                
                this.categories.push(name);
                this.soundsys.addCategory(name, weightNum);
            } else {
                this.categories.push(cat);
                this.soundsys.addCategory(cat, 1);
            }
        }
    }
    
    generate(n = 1, verbose = false, unsorted = verbose, onePerLine = false) {
        let words = '';
        let wordList: string[] = [];
        
        for (let cat of this.categories) {
            wordList = this.soundsys.generate(n, verbose, unsorted, cat);
            if (wordList.length < n) {
                this.stderr(`Could only generate ${wordList.length} word`
                    + `${wordList.length === 1 ? '' : 's'} `
                    + (cat === 'words:' ? '' : `of category '${cat}' `)
                    + `(${n} requested).`);
            }
            
            if (cat !== 'words:') {
                words += `\n\n${cat}:\n`
            }
            words += wordList.join(onePerLine || verbose ? '\n' : ' ');
        }
        
        return words.trim();
    }
    
    paragraph(sentences?: number) {
        return textify(this.soundsys, sentences);
    }
}

export default PhonologyDefinition;
