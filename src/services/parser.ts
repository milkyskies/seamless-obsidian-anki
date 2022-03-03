import {
	App,
	Editor,
	MarkdownView,
} from "obsidian";

import { Properties } from "src/entities/properties";
import { Block } from "src/entities/block";
import { Line } from 'src/entities/line';

export class Parser {
	private app: App;

	private editor: Editor;

	public deep = "hi";
	private matches: string[] = [];

	// https://regex101.com/r/OIZEIQ/3
	// https://regex101.com/r/a1AtGP/2
	// https://regex101.com/r/a1AtGP/3
	// https://regex101.com/r/Ov7ysu/1
	// https://regex101.com/r/Ov7ysu/2
	// https://regex101.com/r/x56wYj/1

	private pattern = /(.+?)(>>)(.*?)((%%.*?anki\((.*?)\).*?%%)(.*)|$)/gmi;

	// https://regex101.com/r/kixTYa/1
	// https://regex101.com/r/c57qt7/2

	private propertyPattern = /(([^\s]+?)(?:=)(".+?"|.+?)|.+?)(?:\s|$)/gi;

	private text: string;
	private lines: string[];

	constructor(app: App) {
		this.app = app;
	}

	public async getBlocks(file: string) : Promise<Block[]> {
		const view = await this.app.workspace.getActiveViewOfType(MarkdownView);
		const blocks: Block[] = [];
		this.editor = await view.editor;

		this.text = this.editor.getValue();
		this.lines = this.text.split("\n");

		const pattern = this.pattern;


		let match = pattern.exec(this.text);
		
		// runs the code inside of the brackets for each line. they are all line numbers!!
		// inline functions dont work but arrow ones do
		this.matchingLines(this.text, pattern).forEach((lineNumber: number, index: number) => {
			match = pattern.exec(this.text);

			for (let i = 0; i < match.length; i++) {
				if (match[i] == null) match[i] = ""; 
			}

			const block = new Block(file, lineNumber, new Line(file, lineNumber, this.editor.getLine(lineNumber)));
			block.line.descriptor = match[1];
			block.line.value = match[3];
			block.properties = this.getProperties(match[6]);
			block.itemParents = this.findLineParents(file, block.line, block.properties["context"]);
			blocks.push(block);
		});
		return blocks;
	}

	private getLineFromLineNumber(file : string, lineNumber: number) : Line {
		return new Line(file, lineNumber, this.lines[lineNumber]);
	}

	private findLineParents(file : string, line: Line, maxParents: number) : Line[] {

		const parents = [];
		
		let lastLineNumber = line.lineNumber;
		
		// For bullets
		let topBulletLevel = line.bulletLevel; //remember, larger number means smaller level.
		
		for (let i = line.lineNumber; i > 1; i--) {
			if (parents.length >= maxParents) break;
			const _line = this.getLineFromLineNumber(file, i - 1)
			if (_line.bulletLevel < topBulletLevel) {
				topBulletLevel = _line.bulletLevel;
				lastLineNumber = _line.lineNumber;
				parents.unshift(_line);
			}
		}

		// For headers
		let bottomHeaderLevel = this.getLineFromLineNumber(file, lastLineNumber).headerLevel;
		for (let i = lastLineNumber; i > 1; i--) {
			if (parents.length >= maxParents) break;
			const _line = this.getLineFromLineNumber(file, i - 1)
			if (_line.headerLevel < bottomHeaderLevel) {
				bottomHeaderLevel = _line.headerLevel;
				parents.unshift(_line);
			}
		}
		
		//parents = parents.reverse();
		return parents;
	}


	private matchingLines(text: string, pattern: RegExp): number[] {
		const matchingLines = [];
		const allLines = text.split("\n");
	
		for (let i = 0; i < allLines.length; i++) {
			if (allLines[i].match(pattern)) {
				matchingLines.push(i);
			}
		}
	
		return matchingLines;
	}

	public getSubStrings(text: string): string[] {
		const substrings: string[] = [];

		const match = this.pattern.exec(text);
		for (let i = 0; i < match.length; i++) {
			if (match[i] == null) match[i] = ""; 
			substrings.push(match[i]);
		}
		return substrings;
	}

	public getProperties(text: string): Properties {
		let match: RegExpExecArray = this.propertyPattern.exec(text);
		
		const writtenProperties = {} as Properties;

		while(match != null) {
			let key: string;
			let value: number | string | boolean;

			for (let i = 0; i < match.length; i++) {
				if (match[i] == null) match[i] = ""; 
			}

			if (match[2] == null || match[2] == "") {
				if (match[1] == "c" || match[1] == "context") {
					key = "context";
					value = 10;
				}
				else {
					key = match[1];
					value = true;
				}
			} else if (match[3] == "true") {
				key = match[2];
				value = true;
			} else if (match[3] == "false") {
				key = match[2];
				value = false;
			}
			else {
				key = match[2];
				value = match[3];
			}

			if (Properties.hasOwnProperty(key)) {
				throw('"'+key+'" is not a valid property.');
			} else {
				writtenProperties[key] = value;
			}

			match = this.propertyPattern.exec(text);
		}

		return new Properties(writtenProperties);
	}
}