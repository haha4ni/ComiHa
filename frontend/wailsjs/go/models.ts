export namespace backend {
	
	export class BookImageData {
	    FileName: string;
	    FileBitmap: number[];
	    FileString: string;
	
	    static createFrom(source: any = {}) {
	        return new BookImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FileName = source["FileName"];
	        this.FileBitmap = source["FileBitmap"];
	        this.FileString = source["FileString"];
	    }
	}
	export class Page {
	    ID: number;
	    MetadataID: number;
	    Image: number;
	    ImageSize: number;
	    ImageWidth: number;
	    ImageHeight: number;
	    Type: string;
	    Comment: string;
	
	    static createFrom(source: any = {}) {
	        return new Page(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.MetadataID = source["MetadataID"];
	        this.Image = source["Image"];
	        this.ImageSize = source["ImageSize"];
	        this.ImageWidth = source["ImageWidth"];
	        this.ImageHeight = source["ImageHeight"];
	        this.Type = source["Type"];
	        this.Comment = source["Comment"];
	    }
	}
	export class Metadata {
	    ID: number;
	    BookInfoID: number;
	    XMLName: xml.Name;
	    Title: string;
	    Series: string;
	    Number: string;
	    Volume: string;
	    AlternateSeries: string;
	    AlternateNumber: string;
	    StoryArc: string;
	    Year: string;
	    Month: string;
	    Day: string;
	    SeriesGroup: string;
	    Summary: string;
	    Notes: string;
	    Writer: string;
	    Publisher: string;
	    Imprint: string;
	    Genre: string;
	    Web: string;
	    PageCount: number;
	    LanguageISO: string;
	    Format: string;
	    AgeRating: string;
	    Manga: string;
	    Characters: string;
	    Teams: string;
	    Locations: string;
	    ScanInformation: string;
	    Pages: Page[];
	    Count: number;
	    AlternateCount: number;
	    Penciller: string;
	    Inker: string;
	    Colorist: string;
	    Letterer: string;
	    CoverArtist: string;
	    Editor: string;
	    BlackAndWhite: string;
	    CommunityRating: number;
	    MainCharacterOrTeam: string;
	    Review: string;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.BookInfoID = source["BookInfoID"];
	        this.XMLName = this.convertValues(source["XMLName"], xml.Name);
	        this.Title = source["Title"];
	        this.Series = source["Series"];
	        this.Number = source["Number"];
	        this.Volume = source["Volume"];
	        this.AlternateSeries = source["AlternateSeries"];
	        this.AlternateNumber = source["AlternateNumber"];
	        this.StoryArc = source["StoryArc"];
	        this.Year = source["Year"];
	        this.Month = source["Month"];
	        this.Day = source["Day"];
	        this.SeriesGroup = source["SeriesGroup"];
	        this.Summary = source["Summary"];
	        this.Notes = source["Notes"];
	        this.Writer = source["Writer"];
	        this.Publisher = source["Publisher"];
	        this.Imprint = source["Imprint"];
	        this.Genre = source["Genre"];
	        this.Web = source["Web"];
	        this.PageCount = source["PageCount"];
	        this.LanguageISO = source["LanguageISO"];
	        this.Format = source["Format"];
	        this.AgeRating = source["AgeRating"];
	        this.Manga = source["Manga"];
	        this.Characters = source["Characters"];
	        this.Teams = source["Teams"];
	        this.Locations = source["Locations"];
	        this.ScanInformation = source["ScanInformation"];
	        this.Pages = this.convertValues(source["Pages"], Page);
	        this.Count = source["Count"];
	        this.AlternateCount = source["AlternateCount"];
	        this.Penciller = source["Penciller"];
	        this.Inker = source["Inker"];
	        this.Colorist = source["Colorist"];
	        this.Letterer = source["Letterer"];
	        this.CoverArtist = source["CoverArtist"];
	        this.Editor = source["Editor"];
	        this.BlackAndWhite = source["BlackAndWhite"];
	        this.CommunityRating = source["CommunityRating"];
	        this.MainCharacterOrTeam = source["MainCharacterOrTeam"];
	        this.Review = source["Review"];
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
	    ID: number;
	    BookInfoID: number;
	    FileName: string;
	    FileIndex: number;
	    FileSize: number;
	
	    static createFrom(source: any = {}) {
	        return new ImageData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.BookInfoID = source["BookInfoID"];
	        this.FileName = source["FileName"];
	        this.FileIndex = source["FileIndex"];
	        this.FileSize = source["FileSize"];
	    }
	}
	export class BookInfo {
	    ID: number;
	    FileName: string;
	    SHA: string;
	    Timestamp: number;
	    ImageData: ImageData[];
	    Metadata: Metadata;
	
	    static createFrom(source: any = {}) {
	        return new BookInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.FileName = source["FileName"];
	        this.SHA = source["SHA"];
	        this.Timestamp = source["Timestamp"];
	        this.ImageData = this.convertValues(source["ImageData"], ImageData);
	        this.Metadata = this.convertValues(source["Metadata"], Metadata);
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

