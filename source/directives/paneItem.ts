///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("paneItem", [() => {
      return {
         restrict: "E",
         replace: true,
         transclude:true,
         template: '<div class="pane-item"><a><i></i><span></span></a><div ng-transclude></div></div>',
         link: (scope, element, attributes) => {
            var link = element.find('a > span');
            link.text(attributes.name);
         }
      };
   }]);
}
