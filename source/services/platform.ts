///<reference path="../../types/node/node.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   var fs = require('fs');
   var path = require('path');
   var gui:any = require('nw.gui');


   export class PlatformNodeWebkit implements IAppPlatform {
      win:any;
      constructor() {
         this.win = gui.Window.get();
      }
      readFile(location:string,done:(data:any) => any){
         fs.readFile(location,(err,data) => {
            if(err){
               console.error(err);
            }
            done('' + data);
         });
      }
      getDirName(location:string):string {
         return path.dirname(location);
      }

      /**
       * The current build output is in the build/ directory, so
       * make inputs relative to one up from there.
       *
       *    var url = platform.getMountPath('assets/images/some.png');
       *    var img = new Image();
       *    img.src = url;
       *
       * TODO: This is pretty bad.  Do something less... bad.
       */
      getMountPath(fromBase:string):string {
         return '../' + fromBase;
      }

      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any) {
         var results:IFileInfo[] = [];
         fs.readdir(location, (err, list) => {
            if (err) {
               return done(err);
            }
            var pending = list.length;
            if (!pending) {
               return done(null, results);
            }
            return list.forEach((file) => {
               var name = path.join(location,file);
               var result:IFileInfo = {
                  name:file,
                  path:location,
                  full:name
               };
               results.push(result);
               fs.stat(name, (err, stat) => {
                  if (stat && stat.isDirectory()) {
                     this.enumPath(name, (err:any, res?:IFileInfo[]) => {

                        // Sort by folder/file and alpha files.
                        result.children = res.sort((a,b)=>{
                           if(!a.children || a.children.length === 0){
                              return 1;
                           }
                           if(!b.children || b.children.length === 0) {
                              return -1;
                           }
                           return a.name.localeCompare(b.name);
                        });
                        if (!--pending) {
                           done(null, results);
                        }
                     });
                  }
                  else {
                     if (!--pending) {
                        done(null, results);
                     }
                  }
               });
            });
         });
      }

      setTitle(text:string){
         this.win.title = text;
      }
   }
   app.factory('platform', ():IAppPlatform => {
      return new PlatformNodeWebkit();
   });
}
