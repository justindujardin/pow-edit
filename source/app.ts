///<reference path="../types/angular/angular.d.ts"/>
///<reference path="../types/ace/ace.d.ts"/>

module pow2.editor {

   export var app = angular.module("PowEdit", [
      'templates-ui',
      'uiTree',
      'uiSplitter'
   ]);

   app.value('rootPath','./assets/maps/');

   export interface IAppPlatform {
      readFile(location:string,done:(data:any) => any);
      setTitle(text:string);
      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any);
      getDirName(location:string):string;
      /**
       * Return a URL for an application asset that is relative to the root directory
       * of this project.
       *
       * @param fromBase The path relative to the root directory.
       */
      getMountPath(fromBase:string):string;
   }

   export interface IFileInfo {
      name:string; // name
      path:string; // path
      full:string; // path.join(path,name)
      type?:string; // "directory" or "file"
      children?:IFileInfo[]; // Only used for directories.
   }
}
