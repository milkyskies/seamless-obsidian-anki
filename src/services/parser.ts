import {
	App,
	Editor,
	MarkdownView,
	TFile,
} from "obsidian";

import { BasicCard } from 'src/entities/basiccard';


export class Parser {
	private app: App;

	private editor: Editor;

	private matches: string[] = [];

	private pattern = /(?<front>.+?)(?<seperator>>>)(?<back>.*?)(?<comment>%%.*?(?<anki>anki\((?<properties>.*?)\)).*?%%|$)/gmi;

	constructor(app: App) {
		this.app = app;
	}

	// https://regex101.com/r/OIZEIQ/3
	// https://regex101.com/r/a1AtGP/2
	// https://regex101.com/r/a1AtGP/3

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

}