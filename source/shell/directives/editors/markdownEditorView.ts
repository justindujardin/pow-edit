///<reference path="../../../../types/ace/ace.d.ts"/>
///<reference path="../../../../types/angular/angular.d.ts"/>
///<reference path="../../../app.ts"/>

module pow2.editor {

   declare var Showdown:any;

   pow2.editor.app.directive("markdownEditorView", ['$sce', '$platform', ($sce:ng.ISCEService,$platform:IAppPlatform) => {
      var renderer = new Showdown.converter();
      return {
         restrict: "E",
         replace: true,
         templateUrl: 'source/shell/directives/editors/markdownEditorView.html',
         link:(scope,element,attrs) => {
            var setUrl = (url:string) => {
               if(!url){
                  return;
               }
               $platform.readFile(url,(data:any) => {
                  if(!data){
                     data = "#Error Reading File: " + url;
                  }
                  scope.markdownRendered = $sce.trustAsHtml(renderer.makeHtml(data));
                  scope.$$phase || scope.$digest();
               });
            };
            scope.markdownMode = "preview";
            scope.$watch(attrs.url,setUrl);
         }
      };
   }]);
}
