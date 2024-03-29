import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, MarkdownPostProcessor, MarkdownPostProcessorContext} from 'obsidian';
import { CardsService } from 'src/services/cards';
//import { Anki } from 'src/services/anki';
//import { Regex } from 'src/regex';
//import { Parser } from 'src/services/parser';

// Remember to rename these classes and interfaces!

interface SeamlessAnkiSettings {
	mySetting: string
}

const DEFAULT_SETTINGS: SeamlessAnkiSettings = {
	mySetting: 'default'
}

export default class SeamlessAnki extends Plugin {
	private cardsService: CardsService;
	
	settings: SeamlessAnkiSettings

	async onload() {
		this.cardsService = new CardsService(this.app);
		await this.loadSettings();

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
		
		this.addRibbonIcon('dice', 'Generate flashcards', () => {
			const activeFile = this.app.workspace.getActiveFile()
			if (activeFile) {
				this.generateCards(activeFile)
			} else {
				new Notice("Open a file before")
			}
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.lastLine());
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});	

		this.addCommand({
			id: 'hello-world',
			name: 'Hello World',
			callback: () => {
				console.log('Hello World!');
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		const postProc: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const paragraphs = el.querySelectorAll('p, li');
			for(let i = 0; i < paragraphs.length; i++) {
				const paragraph = (paragraphs[i] as HTMLElement).innerHTML;
				if (paragraph.contains("&gt;&gt;")) {
					(paragraphs[i] as HTMLElement).innerHTML = paragraph.replace(/\s*&gt;&gt;\s*/gm, " → ");			
				}
			}
		}

		this.registerMarkdownPostProcessor(postProc);
	
	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private generateCards(activeFile: TFile) {
		new Notice("[SeamlessAnki] Generating cards from this page...")

		const cardsService = this.cardsService;
		

		cardsService.execute(activeFile).catch(err => {
			Error(err);
			return;
		}).then(() => new Notice("[SeamlessAnki] Finished generating cards."));
	}
	
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: SeamlessAnki;

	constructor(app: App, plugin: SeamlessAnki) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
	
}

