import { Properties } from 'src/entities/properties';
import { Card } from 'src/entities/card';

export class Block {
    lineNumber: number;
    line: Line;
    properties: Properties;

    descriptor: string;
    value: string;
    item: string;

    descriptorParents: Line[];
    itemParents: Line[]; // This is context

    constructor(lineNumber: number, line: Line) {
        this.lineNumber = lineNumber;
        this.line = line;
    }

    public generateBasicCard() : Card {
        const fields = {
            "Front": this.itemParents[0] + "<br>" + this.descriptor,
            "Back": this.value,
        }
        const card = new Card(this.properties["id"], "Basic", fields);
        //card.properties = this.properties;
        return card;
    }

}

export class Line {
    lineNumber: number;
    text: string;
    bulletLevel = 0; // Bigger is lower level
    headerLevel = 0; // Bigger is higher level

    constructor(lineNumber: number, text: string) {
        this.lineNumber = lineNumber;
        this.text = text;
        this.bulletLevel = this.getBulletLevel(text);
        this.headerLevel = this.getHeaderLevel(text);
    }

    // the more bulletLevel, the farther down it is in the tree
    // 0 is no bullets, 1 is one, 2 is 1 tab and 1 bullet
    private getBulletLevel(text: string): number {
		const match = /(^\t*?)-\s.+/.exec(text);
		if (match == null) {
			return 0;
		}
		return match[1].length + 1;
	}

    // the more bulletlevel, the lower level it is
    // 100 is no header, 1 is 1 header, 2 is 2 header (smaller)
    private getHeaderLevel(text: string): number {
        const match = /(^#+?)\s.+/.exec(text);
        if (match == null) {
            return 100;
        }
        return match[1].length;
    }

}