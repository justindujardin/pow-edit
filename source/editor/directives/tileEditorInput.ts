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
///<reference path="../../app.ts"/>
///<reference path="../controllers/tileEditorController.ts"/>

module pow2.editor {
   /**
    *  Pan Input listener
    *
    *  NOTE: Consider refactor into generic zoom/pan directive that
    *  takes generic x/y/scale props (rather than pixi specific
    *  sceneContainer props) and manipulates them.
    */

   pow2.editor.app.directive("tileEditorInput", [() => {
      return {
         restrict: "A",
         require:["tileEditorView"],
         link:(scope, element, attributes:any,controllers:any[]) => {
            var tileEditor:TileEditorController = controllers[0];
            function getEventTool(ev:any):TileEditorTool{
               if(!angular.element(ev.originalEvent.srcElement).is('canvas')){
                  return null;
               }
               return <TileEditorTool>tileEditor.ed.getActiveTool();
            }
            element.on('mousemove',(ev:any) => {
               var tool:TileEditorTool = getEventTool(ev);
               if(tool){
                  return tool.handleMouseMove(ev);
               }
            });
            element.on('mousedown touchstart',(ev)=>{
               var tool:TileEditorTool = getEventTool(ev);
               if(tool){
                  return tool.handleMouseDown(ev);
               }
            });
            element.on("mousewheel DOMMouseScroll MozMousePixelScroll",(ev)=>{
               var tool:TileEditorTool = getEventTool(ev);
               if(tool){
                  return tool.handleMouseWheel(ev);
               }
            });
         }
      };
   }
   ]);
}
