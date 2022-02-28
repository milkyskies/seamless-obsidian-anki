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
	private basiccards: BasicCard[] = [];

	constructor(app: App) {
		this.app = app;
	}

	// https://regex101.com/r/OIZEIQ/3

	public async generateCards(activeFile: TFile): Promise<BasicCard[]> {

		const view = await this.app.workspace.getActiveViewOfType(MarkdownView);


		const pattern = /(.+?)(?:>>)(.*?)(?:%%(?:.*?)(?:(anki(?:\((.*?)(?:\))).*)%%)|$)/gmi;
		//const text = await this.app.vault.read(activeFile);

		const text = view.editor.getValue();
		let newText: string = text;
		let match = pattern.exec(text);

		newText = newText.replace(pattern, "yo")
		//while (match != null) {
			//this.basiccards.push(new BasicCard(-1, match[1], match[2]));
		//	console.log("Oh yeah: " + match[4]);
		//	match = pattern.exec(text);
		//}
		view.editor.setValue(newText);
		return this.basiccards;
	}
}