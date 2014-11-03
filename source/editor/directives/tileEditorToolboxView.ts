/*
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
///<reference path="../../app.ts"/>
///<reference path="../controllers/tileEditorController.ts"/>

module pow2.editor {
   declare var Hammer:any;

   /**
    * Send input events to the active editor tool.
    */
   pow2.editor.app.directive("tileEditorToolboxView", [() => {
      return {
         restrict: "E",
         replace:true,
         templateUrl:"source/editor/directives/tileEditorToolboxView.html",
         require:["^tileEditorView"],
         link:(scope, element, attributes:any,controllers:any[]) => {
            var tileEditor:TileEditorController = controllers[0];
            var hammertime = new Hammer(element[0], {});
            hammertime.on('tap',(ev:any)=>{
               var el = angular.element(ev.srcEvent.target);
               var toolName:string = el.attr('data-tool-name');
               tileEditor.setTool(toolName);
            });
            scope.$on('$destroy',()=>{
               hammertime.destroy();
            });
         }
      };
   }
   ]);
}
