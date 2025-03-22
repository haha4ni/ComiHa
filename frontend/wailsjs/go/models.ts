export namespace backend {
	
	export class ImageData {
	    FileName: string;
	    FileBitmap: number[];
	
	    static createFrom(source: any = {}) {
	        return new ImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FileName = source["FileName"];
	        this.FileBitmap = source["FileBitmap"];
	    }
	}

}

