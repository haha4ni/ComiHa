export namespace backend {
	
	export class ImageData {
	    filename: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new ImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filename = source["filename"];
	        this.size = source["size"];
	    }
	}
	export class BookInfo {
	    bookname: string;
	    filename: string;
	    sha: string;
	    timestamp: number;
	    imagedata: ImageData[];
	
	    static createFrom(source: any = {}) {
	        return new BookInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.bookname = source["bookname"];
	        this.filename = source["filename"];
	        this.sha = source["sha"];
	        this.timestamp = source["timestamp"];
	        this.imagedata = this.convertValues(source["imagedata"], ImageData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ImageDataTemp {
	    FileName: string;
	    FileBitmap: number[];
	
	    static createFrom(source: any = {}) {
	        return new ImageDataTemp(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FileName = source["FileName"];
	        this.FileBitmap = source["FileBitmap"];
	    }
	}

}

