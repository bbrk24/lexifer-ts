import { SoundSystem } from './wordgen';
declare class PhonologyDefinition {
    private macros;
    private letters;
    private phClasses;
    private defFileLineNum;
    private defFileArr;
    soundsys: SoundSystem;
    constructor(soundsys: SoundSystem, defFile: string);
    private parse;
    private sanityCheck;
    private parseOption;
    private parseFilter;
    private addFilter;
    private parseReject;
    private parseWords;
    private expandMacros;
    private parseLetters;
    private parseClusterfield;
    private parseClass;
    generate(n?: number, unsorted?: boolean): string[];
    paragraph(sentences?: number): string;
}
export default PhonologyDefinition;
