module pow2.editor {

   export var app = angular.module("PowEdit", [
      'templates-ui',
      'uiTree',
      'uiSplitter'
   ]);

   app.value('rootPath','../assets/maps');

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
               console.error(status);
               // called asynchronously if an error occurs
               // or server returns response with an error status.
            });
      }
      getDirName(location:string):string {
         return location.substr(0,location.lastIndexOf('/'));
      }
      getMountPath(fromBase:string):string {
         return '../../' + fromBase;
      }
      enumPath(location:string,done:(err:any,files?:IFileInfo[]) => any) {
      }

      setTitle(text:string){
      }
   }
}
