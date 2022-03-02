import { 
        App, 
        TFile,
        Editor,
        MarkdownView,
     } from 'obsidian';
import { Parser } from 'src/services/parser';
import { Anki } from 'src/services/anki';
import { BasicCard } from 'src/entities/basiccard';

export class CardsService {

    private app: App;
    private file: string;


	private editor: Editor;

    constructor(app: App) {
        this.app = app;
    }

    public async execute(activeFile: TFile): Promise<string[]> {
        
        const parser = new Parser(this.app);

        const cards = await parser.generateCards(activeFile);
        await this.insertCardsOnAnki(cards);
        return;

        // //const filePath = activeFile.basename;
        // const sourcePath = activeFile.path;
        // this.file = await this.app.vault.read(activeFile);
        // console.log(sourcePath);
        // fs.writeFileSync("/home/onesc/Coding/Obsidian Test Vault/Test Vault/.obsidian/plugins/seamless-obsidian-anki/testing/filetext.txt", this.file);
        // return;

    }

    private async insertCardsOnAnki(cards: BasicCard[]) {
        const anki = new Anki();
		for (let i = 0; i < cards.length; i++) {
            let id = await anki.addNote(cards[i].front, cards[i].back)
            id = <string>id
            this.insertAnkiDataOnPage(cards[i].line, id);
		}
    }

    private async insertAnkiDataOnPage(line: number, id: string) {
        const view = await this.app.workspace.getActiveViewOfType(MarkdownView);
        id = id.toString();
        const editor = view.editor;
        const parser = new Parser(this.app);
        const substrings = parser.getSubStrings(editor.getLine(line));

        // Question >> The answer is here %% anki(jjjj) %%  poop
        // front: Question
        // seperator: >>
        // back: The answer is here
        // extra: %% anki(jjjj) %%  poop
        // anki: %% anki(jjjj) %%
        // properties: jjjj
        // rest: poop

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

        //if (anki == "") {
        //    newAnki = `%%anki(id=${ankiData})%%`
        //} 
        
        // properties is an object, get properties from the propertystring
        const propertyObj = parser.getProperties(properties);

        // ankistring is the new one, build new string
        newAnki = this.buildAnkiString(propertyObj, id);

        // write to document
        if(newAnki != anki) {

            newLine = front + seperator + newBack + newAnki + rest;

            editor.setLine(line, newLine);
            console.log("Modified line "+ line)
        } else {
            console.log("No changes")
        }
    }

    private buildAnkiString(propertyObj: any, id: string): string {
        let propertyString = "";
        if(propertyObj["id"] != id) propertyObj["id"] = id;
        for (const key in propertyObj) {
            propertyString = propertyString + " " + key + "=" + propertyObj[key]; 
        }
        propertyString = propertyString.trim();

        const ankiString = "%%anki(" + propertyString + ")%%";

        return ankiString;
    }

}