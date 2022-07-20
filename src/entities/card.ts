export class Card {
    id: number;
    type: string;
    fields: Fields = {};
	deck: string; 

    constructor(id: number, type: string, deck: string) {
        this.id = id;
        this.type = type;
		this.deck = deck;
        //this.fields = fields;
    }
}

interface Fields extends Object {
    [key: string]: unknown;
}
