export class Properties extends Object {
    [index: string]: unknown;

    public defaults = {
        id: -1,
        reverse: false,
    } as Properties;


    id = -1;
    reverse = false;

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
                    console.log(typeof this[key]);
                    propertyString += " " + key + "=" + this[key];
                }
            }
        });

        propertyString = propertyString.trim();
        return propertyString;
    }
}