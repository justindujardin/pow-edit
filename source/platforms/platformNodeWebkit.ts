/**
 Copyright (C) 2014 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
///<reference path="../../types/node/node.d.ts"/>
///<reference path="./platformBase.ts"/>

module pow2.editor {
   var fs = require('fs');
   var path = require('path');
   var gui:any = require('nw.gui');

   export var APP_PROTOCOL_PATH:string = 'app://pow-edit/';

   app.value('rootPath',pow2.editor.APP_PROTOCOL_PATH);

   app.factory('$platform', ():IAppPlatform => {
      return new PlatformNodeWebkit();
   });

   export class PlatformNodeWebkit implements IAppPlatform {
      win:any;
      appRoot:string = process.cwd() + '/';
      constructor() {
         this.win = gui.Window.get();
      }

      readFile(location:string,done:(data:any) => any){
         location = this.pathAsFile(location);
         fs.readFile(location,(err,data) => {
            if(err){
               done(null);
               return;
            }
            done('' + data);
         });
      }

      writeFile(location:string,data:any,done:(error:any)=>any){
         location = this.pathAsFile(location);
         fs.writeFile(location,data,(err) => {
            done(err || null);
         });
      }
      getDirName(location:string):string {
         return path.dirname(location);
      }

      normalizePath(url:string):string{
         return path.normalize(url);
      }

      pathAsAppProtocol(url:string):string {
         if(url.indexOf(pow2.editor.APP_PROTOCOL_PATH) === -1){
            url = url.replace(this.appRoot,pow2.editor.APP_PROTOCOL_PATH);
         }
         return url;
      }
      pathAsFile(url:string):string {
         if(url.indexOf(pow2.editor.APP_PROTOCOL_PATH) === 0){
            url = url.replace(pow2.editor.APP_PROTOCOL_PATH,this.appRoot);
         }
         return url
      }


      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any) {
         var results:IFileInfo[] = [];
         location = this.pathAsFile(location);
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
                  path:this.pathAsAppProtocol(location),
                  full:this.pathAsAppProtocol(name)
               };
               results.push(result);
               fs.stat(name, (err, stat) => {
                  if (stat && stat.isDirectory()) {
                     this.enumPath(name, (err:any, res?:IFileInfo[]) => {

                        // Sort by folder/file and alpha files.
                        result.children = <IFileInfo[]>res.sort((a:any,b:any)=>{
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

}
