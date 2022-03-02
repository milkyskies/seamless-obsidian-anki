import { 
        App, 
        TFile,
        Editor,
        MarkdownView,
     } from 'obsidian';
import { Parser } from 'src/services/parser';
import { Anki } from 'src/services/anki';
import { BasicCard } from 'src/entities/basiccard';
import { Properties } from 'src/entities/properties';
import { Card } from 'src/entities/card';

export class CardsService {

    private app: App;
    private file: string;


	private editor: Editor;

    constructor(app: App) {
        this.app = app;
    }

    public async execute(activeFile: TFile): Promise<string[]> {
        const parser = new Parser(this.app);

        const blocks = await parser.getBlocks();

        //const cards = await parser.generateCards(activeFile);
        //await this.insertCardsOnAnki(cards).then;
        for (let i = 0; i < blocks.length; i++) {
            const id = await this.insertCardsOnAnki(blocks[i].generateBasicCard());
            this.insertAnkiDataOnPage(blocks[i].lineNumber, id);
        }
        return;

        // //const filePath = activeFile.basename;
        // const sourcePath = activeFile.path;
        // this.file = await this.app.vault.read(activeFile);
        // console.log(sourcePath);
        // fs.writeFileSync("/home/onesc/Coding/Obsidian Test Vault/Test Vault/.obsidian/plugins/seamless-obsidian-anki/testing/filetext.txt", this.file);
        // return;

    }

    private async insertCardsOnAnki(card: Card) { // Also gives ID!
        const anki = new Anki();
        const id = await anki.addNote(card.fields["Front"], card.fields["Back"]);
        return id;
    }

    private async insertCardsOnAnkiOld(cards: BasicCard[]) {
        const anki = new Anki();
		for (let i = 0; i < cards.length; i++) {
            let id = await anki.addNote(cards[i].front, cards[i].back)
            id = <string>id
		}
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

        // ankistring is the new one, build new string
        newAnki = this.buildAnkiString(propertyObj, id);

        // write to document
        if(newAnki != anki) {

            newLine = front + seperator + newBack + newAnki + rest;

            editor.setLine(lineNumber, newLine);
            console.log("Modified line "+ lineNumber)
        } else {
            console.log("No changes")
        }
    }

    private buildAnkiString(propertyObj: Properties, id: number): string {
        if(propertyObj["id"] != id) propertyObj["id"] = id;

        const ankiString = "%%anki(" + propertyObj.getPropertyString() + ")%%";

        return ankiString;
    }

}