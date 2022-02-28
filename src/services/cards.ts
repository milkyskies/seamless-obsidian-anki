import { App, TFile } from 'obsidian';
import { Parser } from 'src/services/parser';
import { Anki } from 'src/services/anki';
import { BasicCard } from 'src/entities/basiccard';
export class CardsService {

    private app: App;
    private file: string;

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

        // // https://regex101.com/r/1U3RW4/1
    }

    private async insertCardsOnAnki(cards: BasicCard[]) {
        const anki = new Anki();
		for (let i = 0; i < cards.length; i++) {
			anki.addNote(cards[i].front, cards[i].back);
		}
    }
}