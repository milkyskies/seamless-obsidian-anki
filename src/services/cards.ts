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

        // // https://regex101.com/r/OIZEIQ/2
    }

    private async insertCardsOnAnki(cards: BasicCard[]) {
        const anki = new Anki();
		for (let i = 0; i < cards.length; i++) {
            let id = await anki.addNote(cards[i].front, cards[i].back)
            id = <string>id
            this.insertAnkiDataOnPage(cards[i].line, id);
		}
    }

    private async insertAnkiDataOnPage(line: number, ankiData: string) {
        const view = await this.app.workspace.getActiveViewOfType(MarkdownView);
        ankiData = ankiData.toString();
        const editor = view.editor;
        const parser = new Parser(this.app);
        const substrings = parser.getSubStrings(editor.getLine(line));
        let newLine = "";
        if (!substrings[3].endsWith(" ")) substrings[3] = substrings[3] + " ";
        if (substrings[4] == "") substrings[4] = `%%anki(id=${ankiData})%%`
        for (let i = 1; i < substrings.length; i++) {
            newLine = newLine + substrings[i];
        }
        //console.log(newLine);

        editor.setLine(line, newLine);
    }
}