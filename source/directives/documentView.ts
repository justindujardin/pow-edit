///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("documentView", [() => {
      return {
         restrict: "E",
         replace: true,
         transclude:true,
         templateUrl: 'source/directives/documentView.html'
      };
   }]);
}
