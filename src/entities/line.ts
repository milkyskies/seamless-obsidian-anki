export class Line {
    file: string;
    lineNumber: number;
    text: string;

    bulletLevel = 0; // Bigger is lower level
    headerLevel = 0; // Bigger is higher level
    
    descriptor: string;
    value: string;
    item: string; // not using yet

    constructor(file: string, lineNumber: number, text: string) {
        this.file = file;
        this.lineNumber = lineNumber;
        this.text = this.format(text);
        this.bulletLevel = this.getBulletLevel();
        this.headerLevel = this.getHeaderLevel();
        //this.prefix = this.getPrefix();
        //this.noPrefixText = this.removePrefix();
    }

    // the more bulletLevel, the farther down it is in the tree
    // 0 is no bullets, 1 is one, 2 is 1 tab and 1 bullet
    private getBulletLevel(): number {
		//const match = /(^\t*?)-\s.+/.exec(text);
        const match = /((^\t*?)-\s)(.+)/.exec(this.text);
		if (match == null) {
			return 0;
		}
		return match[2].length + 1;
	}

    // the more bulletlevel, the lower level it is
    // 100 is no header, 1 is 1 header, 2 is 2 header (smaller)
    private getHeaderLevel(): number {
        const match = /((^#+?)\s)(.+)/.exec(this.text);
        if (match == null) {
            return 100;
        }
        return match[2].length;
    }

    public getPrefix(text: string): string {
        const match = /(((^#+?)|(-))\s)(.+)/.exec(text);
        if (match == null) {
            return "";
        } else {
            return match[1]
        } 
    }

    public format(text: string): string {
        let newText = text;
        newText = newText.replace(/%%.*%%/, "")
        newText = newText.replace(/\s*>>\s*/, " → ");
        //const headerMatch = /((^#+?)\s)(.+)/.exec(text);
        //if (headerMatch != null) {
        //    console.log("hi")
        //    newText = headerMatch[1] + "[[" + this.file + "#" + headerMatch[3] + "]]";
        //}
        return newText;
    }
}