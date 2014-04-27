///<reference path="../types/angular/angular.d.ts"/>
///<reference path="../types/ace/ace.d.ts"/>

module pow2.editor {

   export var app = angular.module("PowEdit", [
      'uiTree',
      'uiSplitter'
   ]);

   export interface IAppPlatform {
      readFile(location:string,done:(data:any) => any);
      setTitle(text:string);
      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any);
   }

   export interface IFileInfo {
      name:string; // name
      path:string; // path
      full:string; // path.join(path,name)
      type?:string; // "directory" or "file"
      children?:IFileInfo[]; // Only used for directories.
   }
}
