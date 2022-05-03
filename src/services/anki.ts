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
		//console.log(card.fields);
		const result = await this.invoke("addNote", 6, {
			note: {
				deckName: "Default",
				modelName: Number(card.type),
				options: {
					allowDuplicate: true,
				},
				fields: card.fields,
			},
		}).catch((e: unknown) => console.log(e));

		if (result) {
			return result;
		} else {
			console.log("something aint right");
		}
		//if (result) console.log(result)
		//result.then(value => console.log(value));
	}

	public async updateNoteFields(card: Card) {
		await this.invoke("updateNoteFields", 6, {
			note: {
        id: Number(card.id),
				deckName: "Default",
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
			notes: [
        Number(card.id),
    ],
		}).catch((e: unknown) => console.log(e));
  }

	public async listDecks() {
		await this.invoke("createDeck", 6, { deck: "test1" });
		const result = await this.invoke("deckNames", 6);
		console.log(`got list of decks: ${result}`);
	}
}
