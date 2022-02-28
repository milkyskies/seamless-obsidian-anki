import {
	App,
	Editor,
	editorEditorField,
	MarkdownView,
	TFile,
} from "obsidian";

import { BasicCard } from 'src/entities/basiccard';


export class Parser {
	private app: App;

	private editor: Editor;

	private matches: string[] = [];
	private basiccards: BasicCard[] = [];

	constructor(app: App) {
		this.app = app;
	}

	// https://regex101.com/r/OIZEIQ/3
	// https://regex101.com/r/a1AtGP/2

	public async generateCards(activeFile: TFile): Promise<BasicCard[]> {

		const view = await this.app.workspace.getActiveViewOfType(MarkdownView);


		const pattern = /(.+?)(>>)(.*?)(%%(.*?(anki\((.*?)\)).*)?%%|$)/gmi;
		//const text = await this.app.vault.read(activeFile);
		const editor = view.editor;
		const text = editor.getValue();
		let newText: string = text;
		let match = pattern.exec(text);

		//console.log(this.matchingLines(text, pattern));

		// runs the code inside of the brackets for each line. they are all line numbers!!
		this.matchingLines(text, pattern).forEach(function (line, index) {
			match = pattern.exec(text);
			if (match[4] == "") {
				editor.setLine(line, match[1] + match[2] + match[3] + " %%anki(id:aaa)%%");
			}
			console.log("Oh yeah: " + match[4] + " (Line number " + line );
		});


		//newText = newText.replace(pattern, "yo")

		//console.log(newText);
		//
		//while (match != null) {
			//this.basiccards.push(new BasicCard(-1, match[1], match[3]));
			//console.log("Oh yeah: " + match[4]);
			//newText = newText.replace(pattern, "yo")
			//console.log(newText);
			//console.log("hello");
			//match = pattern.exec(text);
		//}
		//view.editor.setValue(newText);
		return this.basiccards;
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
}