import { App, TFile, Editor, MarkdownView } from "obsidian";
import { Parser } from "src/services/parser";
import { Anki } from "src/services/anki";
import { Properties } from "src/entities/properties";
import { Card } from "src/entities/card";
import { Block } from "src/entities/block";
import { marked } from "marked";

export class CardsService {
	private app: App;
	private file: string;

	private editor: Editor;

	constructor(app: App) {
		this.app = app;
	}

	public async execute(activeFile: TFile): Promise<string[]> {
		this.file = activeFile.basename;

		const parser = new Parser(this.app);

		const blocks = await parser.getBlocks(this.file);

		for (let i = 0; i < blocks.length; i++) {
			let id = -1;
			let updatePage = false;
			let updateCard = false;
			if (blocks[i].properties.id == -1) {
				id = await this.insertCardOnAnki(this.generateCard(blocks[i]));
				updatePage = true;
			} else {
				id = blocks[i].properties.id;
			}
			if (blocks[i].properties.update) {
				updateCard = true;
			}

			if (updateCard == true) {
				await this.updateCardOnAnki(this.generateCard(blocks[i]));
				updatePage = true;
			}

            if (blocks[i].properties.delete) {
                await this.deleteCardOnAnki(this.generateCard(blocks[i]));
                updatePage = true;
                console.log("Deleted card " + id);

            }

			if (updatePage == true) {
				this.insertAnkiDataOnPage(blocks[i].lineNumber, id);
				console.log("Updated card " + id);
			}
		}
		return;

		// //const filePath = activeFile.basename;
		// const sourcePath = activeFile.path;
		// this.file = await this.app.vault.read(activeFile);
		// console.log(sourcePath);
		// fs.writeFileSync("/home/onesc/Coding/Obsidian Test Vault/Test Vault/.obsidian/plugins/seamless-obsidian-anki/testing/filetext.txt", this.file);
		// return;
	}

	private generateCard(block: Block): Card {
		let card: Card;
		if (block.properties["type"] == "Basic") {
			card = new Card(block.properties["id"], "Cloze");
			const parents = block.itemParents;
			if (parents.length > 0) {
				card.fields["Text"] = this.convertTextToHTML(
					block.condenseLines(block.itemParents) +
						"\n" +
						block.line.descriptor +
						" → {{c1::" +
						block.line.value +
						"}}"
				);
			} else {
				card.fields["Text"] = this.convertTextToHTML(
					this.removePrefix(block.line.descriptor) +
						" → {{c1::" +
						block.line.value +
						"}}"
				);
			}
		}
		return card;
	}

	public removePrefix(text: string): string {
		const match = /(((^#+?)|(-))\s)(.+)/.exec(text);
		if (match && match[5]) {
			return match[5].trim();
		} else {
			return text;
		}
	}

	public convertTextToHTML(text: string): string {
		const html = marked.parse(text);
		return html;
	}

	private async insertCardOnAnki(card: Card) {
		const anki = new Anki();
		const id = await anki.addNote(card);
		return id;
	}

	private async updateCardOnAnki(card: Card) {
		const anki = new Anki();
		const id = await anki.updateNoteFields(card);
		return id;
	}

	private async deleteCardOnAnki(card: Card) {
		const anki = new Anki();
		const id = await anki.deleteNotes(card);
		return id;
	}

	private async insertAnkiDataOnPage(lineNumber: number, id: number) {
		const view = await this.app.workspace.getActiveViewOfType(MarkdownView);
		const editor = view.editor;
		const parser = new Parser(this.app);
		const substrings = parser.getSubStrings(editor.getLine(lineNumber));

		// Question >> The answer is here %% anki(jjjj) %%  p
		// front: Question
		// seperator: >>
		// back: The answer is here
		// extra: %% anki(jjjj) %%  p
		// anki: %% anki(jjjj) %%
		// properties: jjjj
		// rest: p

		//const full = substrings[0];
		const front = substrings[1];
		const seperator = substrings[2];
		const back = substrings[3];
		//const extra = substrings[4]; //don't really need maybe
		const anki = substrings[5];
		const properties = substrings[6];
		const rest = substrings[7];

		let newAnki = anki;
		let newBack = back;

		let newLine = "";

		if (!back.endsWith(" ")) newBack = back + " ";

		// properties is an object, get properties from the propertystring
		const propertyObj = parser.getProperties(properties);

		propertyObj.update = false;

		// ankistring is the new one, build new string
		newAnki = this.buildAnkiString(propertyObj, id);

		if (propertyObj.delete == true) {
            editor.setLine(lineNumber, "");
			console.log("Cleared line " + lineNumber);
		}
		// write to document
		else if (newAnki != anki) {
			newLine = front + seperator + newBack + newAnki + rest;

			editor.setLine(lineNumber, newLine);
			console.log("Modified line " + lineNumber);
		} else {
			console.log("No changes");
		}
	}

	private buildAnkiString(propertyObj: Properties, id: number): string {
		if (propertyObj["id"] != id) propertyObj["id"] = id;

		const ankiString = "%%anki(" + propertyObj.getPropertyString() + ")%%";

		return ankiString;
	}
}
