export class Properties extends Object {
    [index: string]: unknown;

    public defaults = {
        id: -1,
        reverse: false,
        update: false,
        delete: false,
        item: 0,
        context: 0,
    } as Properties;

    id = -1;
    update = false;
    delete = false;
    reverse = false;
    item = 0; // the item is the same as the descriptor
    context = 0; // no context

    // https://stackoverflow.com/questions/46496245/how-to-supply-default-values-to-es6-class-properties

    constructor(options: Properties) {
        super();
        const opts = Object.assign({}, this.defaults, options);
        Object.keys(this.defaults).forEach(key => {
            if (key != "defaults") {
                this[key] = opts[key];
            }
        });
    }

    public getPropertyString() : string {
        let propertyString = "";

        Object.keys(this).forEach(key => {
            if (key!= "defaults") {
                if (this[key] != this.defaults[key]) {
                    propertyString += " " + key + "=" + this[key];
                }
            }
        });

        propertyString = propertyString.trim();
        return propertyString;
    }
}