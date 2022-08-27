var pug = require("pug");
var path = require("path");
var pdf = require("html-pdf");
export class ReportBuilder {
    name:string;
    reportData: Object;
    templateDir: string;
    constructor(props:any){
        this.name = props.name;
        this.reportData = props.reportData;

        this.templateDir = path.join(__dirname, '..', '..', '..', 'templates');
    }


    toHTML():string {
        switch(this.name){
            case 'sign-out-log':
                return pug.renderFile(path.join(this.templateDir, 'sign-out.report.pug'), this.reportData);
            default:
                return "<div />"
        }
    }


    toPDF(path: string, options = {}): any {
        pdf.create(this.toHTML(), options).toFile(path, function(err:any, res:any){
            if (err) {
              console.log(err);
            } else {
              console.log(res.filename);
            }
          })
    }
}