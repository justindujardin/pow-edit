///<reference path="../../../../types/ace/ace.d.ts"/>
///<reference path="../../../../types/angular/angular.d.ts"/>
///<reference path="../../../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("imageEditorView", [() => {
      return {
         restrict: "E",
         replace: true,
         templateUrl: 'source/shell/directives/editors/imageEditorView.html'
      };
   }]);

   pow2.editor.app.config(['$compileProvider', ($compileProvider) => {
      var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|app):|data:image\//);
   }]);
}
