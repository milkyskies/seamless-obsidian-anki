import { Properties } from 'src/entities/properties';
import { Line } from 'src/entities/line';

export class Block {
    file: string;
    lineNumber: number;
    line: Line;
    properties: Properties;


    // descriptor: string;
    // value: string;
    //item: string; // not using yet

    descriptorParents: Line[];
    itemParents: Line[]; // This is context, assigned from parser

    constructor(file: string, lineNumber: number, line: Line) {
        this.file = file;
        this.lineNumber = lineNumber;
        this.line = line;
    }

    public condenseLines(lines: Line[]) : string {
        let condensedText = "";

        if (lines.length > 0) {
            condensedText = lines.map(line => line.text).join("\n");
        }

        return condensedText;
    }        
    
}