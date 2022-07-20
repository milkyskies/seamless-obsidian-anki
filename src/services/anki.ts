import { Notice } from "obsidian";
import { Card } from "src/entities/card";

export class Anki {
	private invoke(action: string, version = 6, params = {}): any {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.addEventListener("error", () =>
				reject("failed to issue request")
			);
			xhr.addEventListener("load", () => {
				try {
					const response = JSON.parse(xhr.responseText);
					if (Object.getOwnPropertyNames(response).length != 2) {
						throw "response has an unexpected number of fields";
					}
					if (
						!Object.prototype.hasOwnProperty.call(response, "error")
					) {
						throw "response is missing required error field";
					}
					if (
						!Object.prototype.hasOwnProperty.call(
							response,
							"result"
						)
					) {
						throw "response is missing required result field";
					}
					if (response.error) {
						throw response.error;
					}
					resolve(response.result);
				} catch (e) {
					reject(e);
				}
			});

			xhr.open("POST", "http://127.0.0.1:8765");
			xhr.send(JSON.stringify({ action, version, params }));
		});
	}

	public async addNote(card: Card) {
		const result = await this.invoke("addNote", 6, {
			note: {
				deckName: card.deck,
				modelName: card.type,
				options: {
					allowDuplicate: true,
				},
				fields: card.fields,
			},
		}).catch((e: unknown) => new Notice("[SeamlessAnki] " + e));

		console.log(result);
		if (result) {
			return result;
		}
		//if (result) console.log(result)
		//result.then(value => console.log(value));
	}

	public async getDeck(id: number) {
		const result = await this.invoke("getDecks", 6, {
			"cards": [id]
		}).catch((e: unknown) => console.log(e));
		return Object.keys(result)[0];
	}


	public async changeDeck(id: number, targetDeck: string) {
		const result = await this.invoke("changeDeck", 6, {
			"cards": [id],
			"deck": targetDeck
		}).catch((e: unknown) => console.log(e));

		return result[0];

	}

	public async updateNoteFields(card: Card) {
		console.log(card.deck);
		await this.invoke("updateNoteFields", 6, {
			note: {
				id: Number(card.id),
				modelName: card.type,
				options: {
					allowDuplicate: true,
				},
				fields: card.fields,
			},
		}).catch((e: unknown) => console.log(e));
	}

	public async deleteNotes(card: Card) {
		await this.invoke("deleteNotes", 6, {
			notes: [Number(card.id)],
		}).catch((e: unknown) => console.log(e));
	}

	public async listDecks() {
		await this.invoke("createDeck", 6, { deck: "test1" });
		const result = await this.invoke("deckNames", 6);
		console.log(`got list of decks: ${result}`);
	}
}
