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
   pow2.editor.app.directive("tileEditorInput", [() => {
      return {
         restrict: "A",
         require:["tileEditorView"],
         link:(scope, element, attributes:any,controllers:any[]) => {
            var tileEditor:TileEditorController = controllers[0];
            var initScale = tileEditor.cameraZoom;

            function getEventTool(ev:any):TileEditorTool{
               if(!angular.element(ev.srcEvent.srcElement).is('canvas')){
                  return null;
               }
               return <TileEditorTool>tileEditor.ed.getActiveTool();
            }

            var hammertime = new Hammer(element[0], {});
            hammertime.get('pinch').set({ enable: true });
            hammertime.on('pinch', function(ev) {
               tileEditor.cameraZoom = initScale * ev.scale;
               tileEditor.updateCamera();
            });
            hammertime.on('pinchstart',(ev:any)=>{
               initScale = tileEditor.cameraZoom;
            });

            // Forward hammer events to the active tool, converting
            // the names into very basic camelCase naming.
            // e.g. panstart -> onPanstart, panend -> onPanend
            var forwardEvents:string[] = [
               'tap','pan','panstart','panend'
            ];
            function _forwardEvent(eventName:string) {
               var toolCamelMethod:string = 'on' + eventName[0].toUpperCase() + eventName.substr(1);
               hammertime.on(eventName,(ev:any)=>{
                  var tool:TileEditorTool = getEventTool(ev);
                  if(tool && tool[toolCamelMethod]){
                     return tool[toolCamelMethod](ev);
                  }
               });
            }
            angular.forEach(forwardEvents,_forwardEvent);
            element.on("mousewheel DOMMouseScroll MozMousePixelScroll",(ev)=>{
               var tool:TileEditorTool = <TileEditorTool>tileEditor.ed.getActiveTool();
               if(tool){
                  return tool.handleMouseWheel(ev);
               }
            });
            scope.$on('$destroy',()=>{
               hammertime.destroy();
            });
         }
      };
   }
   ]);
}
