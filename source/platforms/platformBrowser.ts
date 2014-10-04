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
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../interfaces/IAppPlatform.ts"/>

module pow2.editor {

   export var app = angular.module("pow-edit", [
      'templates-ui',
      'uiTree'
   ]);

   app.value('rootPath','/');

   app.factory('$platform', ['$http', ($http):IAppPlatform => {
      return new PlatformBrowser($http);
   }]);

   export class PlatformBrowser implements IAppPlatform {
      constructor(public $http:ng.IHttpService) {}
      readFile(location:string,done:(data:any) => any){
         this.$http({method: 'GET', url: location}).
            success(function(data, status, headers, config) {
               done(data);
               // this callback will be called asynchronously
               // when the response is available
            }).
            error(function(data, status, headers, config) {
               done(null);
               // called asynchronously if an error occurs
               // or server returns response with an error status.
            });
      }
      getDirName(location:string):string {
         return location.substr(0,location.lastIndexOf('/'));
      }
      normalizePath(url:string):string{
         return url;
      }

      pathAsAppProtocol(url:string):string { return url; }
      pathAsFile(url:string):string { return url; }

      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any) {
         this.$http({method: 'GET', url: '/files'}).
            success(function(data, status, headers, config) {
               done(null,data);
               // this callback will be called asynchronously
               // when the response is available
            }).
            error(function(data, status, headers, config) {
               done(status);
               // called asynchronously if an error occurs
               // or server returns response with an error status.
            });
      }
      writeFile(location:string,data:any,done:(error:any)=>any) {
         done("Unsupported Platform");
      }

      setTitle(text:string){
      }
   }
}
