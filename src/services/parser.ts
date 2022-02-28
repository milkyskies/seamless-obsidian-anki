import {
	App,
	TFile,
} from "obsidian";

import { BasicCard } from 'src/entities/basiccard';


export class Parser {
	
	private app: App;
	private matches: string[] = [];
	private basiccards: BasicCard[] = [];
	
	constructor(app: App) {
		this.app = app;
	}
	
	public async generateCards(activeFile: TFile): Promise<BasicCard[]> {
		const pattern = /(.+)(>>)(.+)/gmi;
		const text = await this.app.vault.read(activeFile);
		
		let match = pattern.exec(text);
		
		while (match != null) {
			this.basiccards.push(new BasicCard(-1, match[1], match[3]));
			match = pattern.exec(text);
		}

		return this.basiccards;

		//for (let i = 0; i < this.basiccards.length; i++) {
		//	anki.addNote(this.basiccards[i].front, this.basiccards[i].back);
		//}
	}
}