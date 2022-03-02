import {
	App,
	Editor,
	MarkdownView,
	TFile,
} from "obsidian";

import { BasicCard } from 'src/entities/basiccard';
import { Properties } from "src/entities/properties";

export class Parser {
	private app: App;

	private editor: Editor;

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

	private propertyPattern = /(([^\s]+?)(?:=)(".+?"|.+?)|.+?)(?:\s|$)/ig

	constructor(app: App) {
		this.app = app;
	}

	public async generateCards(activeFile: TFile): Promise<BasicCard[]> {
		const view = await this.app.workspace.getActiveViewOfType(MarkdownView);
		const basiccards: BasicCard[] = [];
		const editor = view.editor;
		const text = editor.getValue();
		const pattern = this.pattern;


		let match = pattern.exec(text);

		//console.log(this.matchingLines(text, pattern));

		// runs the code inside of the brackets for each line. they are all line numbers!!
		this.matchingLines(text, pattern).forEach(function (line: number, index: number) {
			match = pattern.exec(text);

			basiccards.push(new BasicCard(-1, line, match[1], match[3]));
		});

		return basiccards;
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

			if (match[2] == null || match[2] == "") {
				key = match[1];
				value = true;
			} else {
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


	// public getPropertiesOld(text: string): string[] {

	// 	// "properties" is the object of all properties for one block
	// 	// "match" is one property block, and the [i] is values of that property

	// 	const properties: any = {};

	// 	const validProperties: string[] = ["id", "reverse"]

	// 	let match: any = this.propertyPattern.exec(text);
		
	// 	while(match != null) {

	// 		let key;
	// 		let value;
	// 		if (match[2] == null || match[2] == "") {
	// 			key = match[1];
	// 			value = "true";
	// 			//properties[match[1]] = "true";
	// 		} else {
	// 			key = match[2];
	// 			value = match[3];
	// 			//properties[match[2]] = match[3];
	// 		}

	// 		if (!validProperties.includes(key)) {
	// 			throw('"'+key+'" is not a valid property.');
	// 		} else {
	// 			properties[key] = value;
	// 		}

	// 		match = this.propertyPattern.exec(text);
	// 	}
	// 	return properties;
	// }

}