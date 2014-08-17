///<reference path="../../../../types/ace/ace.d.ts"/>
///<reference path="../../../../types/angular/angular.d.ts"/>
///<reference path="../../../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("textEditorView", [
      "$timeout",
      "$rootScope",
      ($timeout:ng.ITimeoutService,$rootScope:any) => {
         var Editor:any = ace.require("ace/editor").Editor;
         var Renderer:any = ace.require("ace/virtual_renderer").VirtualRenderer;
         return {
            restrict: "E",
            require: "^ngModel",
            replace: true,
            scope:{
               history: "="
            },
            templateUrl:"source/shell/directives/editors/textEditorView.html",
            link: ($scope, $el, attrs:any, model) => {
               var UndoManager:any = ace.require("ace/undomanager").UndoManager;
               var history:AceAjax.UndoManager = new UndoManager();
               var editor:AceAjax.Editor = new Editor(new Renderer($el[0], "ace/theme/tomorrow_night"));
               var session:AceAjax.IEditSession = editor.getSession();
//
//               var modelist = ace.require('ace/ext/modelist')
//               var filePath = 'blahblah/weee/some.js'
//               var mode = modelist.getModeForPath(filePath).mode
//               editor.session.setMode(mode)
//
               session.setMode(attrs.mode || "ace/mode/xml");
               session.setUndoManager(history);
               model.$render = function() {
                  if(model.$modelValue){
                     return session.setValue(model.$modelValue);
                  }
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
