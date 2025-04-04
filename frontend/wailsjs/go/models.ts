export namespace backend {
	
	export class Metadata {
	    title: string;
	    volume: string;
	    author: string;
	    tags: string[];
	    publisher: string;
	    release_date: string;
	    page_count: string;
	    epub_format: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.volume = source["volume"];
	        this.author = source["author"];
	        this.tags = source["tags"];
	        this.publisher = source["publisher"];
	        this.release_date = source["release_date"];
	        this.page_count = source["page_count"];
	        this.epub_format = source["epub_format"];
	        this.description = source["description"];
	    }
	}
	export class ImageData {
	    filename: string;
	    fileindex: number;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new ImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filename = source["filename"];
	        this.fileindex = source["fileindex"];
	        this.size = source["size"];
	    }
	}
	export class BookInfo {
	    bookname: string;
	    booknumber: string;
	    filename: string;
	    sha: string;
	    timestamp: number;
	    imagedata: ImageData[];
	    metadata: Metadata;
	
	    static createFrom(source: any = {}) {
	        return new BookInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.bookname = source["bookname"];
	        this.booknumber = source["booknumber"];
	        this.filename = source["filename"];
	        this.sha = source["sha"];
	        this.timestamp = source["timestamp"];
	        this.imagedata = this.convertValues(source["imagedata"], ImageData);
	        this.metadata = this.convertValues(source["metadata"], Metadata);
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

