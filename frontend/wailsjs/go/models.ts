export namespace backend {
	
	export class Metadata {
	    XMLName: xml.Name;
	    title: string;
	    series: string;
	    number: string;
	    volume: string;
	    alternateSeries: string;
	    alternateNumber: string;
	    storyArc: string;
	    year: string;
	    month: string;
	    day: string;
	    seriesGroup: string;
	    summary: string;
	    notes: string;
	    writer: string;
	    publisher: string;
	    imprint: string;
	    genre: string;
	    web: string;
	    pageCount: number;
	    languageISO: string;
	    format: string;
	    ageRating: string;
	    manga: string;
	    characters: string;
	    teams: string;
	    locations: string;
	    scanInformation: string;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.XMLName = this.convertValues(source["XMLName"], xml.Name);
	        this.title = source["title"];
	        this.series = source["series"];
	        this.number = source["number"];
	        this.volume = source["volume"];
	        this.alternateSeries = source["alternateSeries"];
	        this.alternateNumber = source["alternateNumber"];
	        this.storyArc = source["storyArc"];
	        this.year = source["year"];
	        this.month = source["month"];
	        this.day = source["day"];
	        this.seriesGroup = source["seriesGroup"];
	        this.summary = source["summary"];
	        this.notes = source["notes"];
	        this.writer = source["writer"];
	        this.publisher = source["publisher"];
	        this.imprint = source["imprint"];
	        this.genre = source["genre"];
	        this.web = source["web"];
	        this.pageCount = source["pageCount"];
	        this.languageISO = source["languageISO"];
	        this.format = source["format"];
	        this.ageRating = source["ageRating"];
	        this.manga = source["manga"];
	        this.characters = source["characters"];
	        this.teams = source["teams"];
	        this.locations = source["locations"];
	        this.scanInformation = source["scanInformation"];
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
	
	export class SeriesInfo {
	    seriesname: string;
	    bookinfokeys: string[];
	
	    static createFrom(source: any = {}) {
	        return new SeriesInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seriesname = source["seriesname"];
	        this.bookinfokeys = source["bookinfokeys"];
	    }
	}

}

export namespace xml {
	
	export class Name {
	    Space: string;
	    Local: string;
	
	    static createFrom(source: any = {}) {
	        return new Name(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Space = source["Space"];
	        this.Local = source["Local"];
	    }
	}

}

