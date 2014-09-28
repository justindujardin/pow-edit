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
   pow2.editor.app.directive("tileEditorInput", [() => {
      /**
       *  Pan Input listener
       *
       *  TODO: Refactor into generic zoom/pan directive that
       *  takes generic x/y/scale props (rather than pixi specific
       *  sceneContainer props) and manipulates them.
       */
      function handleMouseDown(tileEditor:TileEditorController,event:any) {
         var e = event;
         if(event.originalEvent.touches) {
            e = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
         }
         var mouseAtIndex:number = tileEditor.picker.indexFromPoint(tileEditor.mouseEventToWorld(event));
         switch(tileEditor.activeTool){
            case 'paint':
               tileEditor.dragPaint = tileEditor.tileIndex;
               tileEditor.paintAt(mouseAtIndex);
               var _stopPaint = () => {
                  tileEditor.dragPaint = -1;
                  tileEditor.$document.off('mouseup touchend',_stopPaint);
               };
               tileEditor.$document.on('mouseup touchend', _stopPaint);
               return;
               break;
            case 'flood':
               if(mouseAtIndex != -1){
                  tileEditor.floodPaintAt(mouseAtIndex,tileEditor.tileIndex);
               }
               return;
               break;
            case 'erase':
               tileEditor.dragPaint = 0;
               var _stopPaint = () => {
                  tileEditor.dragPaint = -1;
                  tileEditor.$document.off('mouseup touchend',_stopPaint);
               };
               tileEditor.$document.on('mouseup touchend', _stopPaint);
               return;
               break;
            case 'move':
               tileEditor.dragPaint = -1;
               tileEditor.drag.active = true;
               tileEditor.drag.start = new pow2.Point(e.clientX,e.clientY);
               tileEditor.drag.current = tileEditor.drag.start.clone();
               tileEditor.drag.delta = new pow2.Point(0,0);
               tileEditor.drag.cameraStart = new Point(tileEditor.cameraCenter.x,tileEditor.cameraCenter.y);
               var _mouseUp = () => {
                  tileEditor.$document.off('mousemove touchmove',_mouseMove);
                  tileEditor.$document.off('mouseup touchend',_mouseUp);
                  tileEditor.resetDrag();
               };
               var _mouseMove = (evt:any) => {
                  if(!tileEditor.drag.active){
                     return;
                  }
                  if(evt.originalEvent.touches) {
                     evt = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
                  }
                  tileEditor.drag.current.set(evt.clientX,evt.clientY);
                  tileEditor.drag.delta.set(tileEditor.drag.start.x - tileEditor.drag.current.x, tileEditor.drag.start.y - tileEditor.drag.current.y);

                  tileEditor.cameraCenter.x = tileEditor.drag.cameraStart.x + tileEditor.drag.delta.x * (1 / tileEditor.cameraZoom);
                  tileEditor.cameraCenter.y = tileEditor.drag.cameraStart.y + tileEditor.drag.delta.y * (1 / tileEditor.cameraZoom);

                  tileEditor.updateCamera();
                  event.stopPropagation();
                  return false;
               };
               tileEditor.$document.on('mousemove touchmove', _mouseMove);
               tileEditor.$document.on('mouseup touchend', _mouseUp);
               event.stopPropagation();
               return false;
               break;
         }
      }
      /**
       *  Zoom Input listener
       */
      function handleMouseWheel(tileEditor:TileEditorController,event) {
         if(!tileEditor.sceneContainer) {
            return;
         }
         var delta:number = (event.originalEvent.detail ? event.originalEvent.detail * -1 : event.originalEvent.wheelDelta);
         var move:number = tileEditor.cameraZoom / 10;
         tileEditor.cameraZoom += (delta > 0 ? move : -move);
         tileEditor.updateCamera();
         event.stopImmediatePropagation();
         event.preventDefault();
         return false;
      }

      return {
         restrict: "A",
         require:["tileEditorView"],
         link:(scope, element, attributes:any,controllers:any[]) => {
            var tileEditor:TileEditorController = controllers[0];
            var lastHit:EditableTile = null;
            var viewLayers = tileEditor.getViewLayers();
            element.on('mousemove',(ev:any) => {
               tileEditor.mouseAt = tileEditor.mouseEventToWorld(ev);
               if(tileEditor.activeTool === 'paint' && tileEditor.dragPaint != -1){
                  tileEditor.paintAt(tileEditor.picker.indexFromPoint(tileEditor.mouseAt));
                  return;
               }

               var pick:IPowTilePick = tileEditor.picker.pickFirst(tileEditor.mouseAt);
               var hitLayer:string = null;
               if(pick){
                  hitLayer = pick.layer.name;
                  var uiLayer:TileEditorViewLayer = viewLayers[pick.layerIndex];
                  if(uiLayer){
                     if(lastHit){
                        lastHit.sprite.tint = 0xFFFFFF;
                     }
                     lastHit = uiLayer.tiles[pick.index];
                     lastHit.sprite.tint = 0x00FF00;
                  }
               }
               else if(lastHit) {
                  lastHit.sprite.tint = 0xFFFFFF;
                  lastHit = null;
               }
               tileEditor.setDebugText(JSON.stringify({
                  mapX:Math.floor(tileEditor.sceneContainer.x),
                  mapY:Math.floor(tileEditor.sceneContainer.y),
                  mouseX:tileEditor.mouseAt.x,
                  mouseY:tileEditor.mouseAt.y,
                  hitLayer:hitLayer
               },null,2));
            });

            element.on('mousedown touchstart',(e)=>{
               handleMouseDown(tileEditor,e);
            });
            element.on("mousewheel DOMMouseScroll MozMousePixelScroll",(e)=>{
               handleMouseWheel(tileEditor,e);
            });

         }
      };
   }
   ]);
}
