///<reference path="./types/angular/angular.d.ts"/>
///<reference path="./types/ace/ace.d.ts"/>

module pow2.editor {
   export var app = angular.module("PowEdit", []);
   export interface IAppPlatform {
      readFile(location:string,done:(data:any) => any);
      setTitle(text:string);
   }
}
