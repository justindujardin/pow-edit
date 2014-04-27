///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("aceEditor", [
      "$timeout",
      "$rootScope",
      ($timeout:ng.ITimeoutService,$rootScope:any) => {
         var Editor:any = ace.require("ace/editor").Editor;
         var Renderer:any = ace.require("ace/virtual_renderer").VirtualRenderer;
         return {
            restrict: "E",
            require: "ngModel",
            replace: true,
            scope:{
               history: "="
            },
            template: "<div class=\"ace-container\"></div>",
            link: ($scope, $el, attrs:any, model) => {
               var editor:AceAjax.Editor = new Editor(new Renderer($el[0], "ace/theme/textmate"));
               var session:AceAjax.IEditSession = editor.getSession();
               session.setMode("ace/mode/typescript");
               session.setUndoManager(<AceAjax.UndoManager>$scope.history);
               model.$render = function() {
                  return session.setValue(model.$modelValue);
               };
               var updateViewValue = () => {
                  $rootScope.$$phase || $scope.$$phase || $scope.$apply(() => {
                     model.$setViewValue(session.getValue());
                  });
               };
               var debounce;
               angular.element(window).on('resize',function(){
                  $timeout.cancel(debounce);
                  debounce = $timeout( function() {
                     editor.resize();
                  }, 20);
               });
               session.on("change", updateViewValue);
               return $scope.$on("$destroy", function() {
                  return session.removeListener("change", updateViewValue);
               });
            }
         };
      }
   ]);
}
