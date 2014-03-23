///<reference path="../types/node.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   var fs = require('fs');
   var gui:any = require('nw.gui');


   export class PlatformNodeWebkit implements IAppPlatform {
      win:any;
      constructor() {
         this.win = gui.Window.get();
      }
      readFile(location:string,done:(data:any) => any){
         done('' + fs.readFileSync(location));
      }
      setTitle(text:string){
         this.win.title = text;
      }
   }
   app.factory('platform', ():IAppPlatform => {
      return new PlatformNodeWebkit();
   });
}
