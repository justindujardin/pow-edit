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
///<reference path="../paintTool.ts"/>
module pow2.editor {

   export class LayerFloodPaintTool extends PaintTool {
      static NAME:string = 'Flood Paint';
      name:string = LayerFloodPaintTool.NAME;
      iconClass:string = 'fa-paint-brush';
      onTap(ev:MouseEvent):any{
         var mousePoint:pow2.Point = this.ctrl.mouseEventToWorld(ev);
         var mouseAtIndex:number = this.ctrl.picker.indexFromPoint(mousePoint);
         var area: pow2.Rect = new pow2.Rect(this.ctrl.tileMap.point,this.ctrl.tileMap.size);
         if(area.pointInRect(mousePoint)){
            this.floodPaintAt(mouseAtIndex,this.ctrl.tileIndex);
            return false;
         }
      }
      floodPaintAt(index:number,newGid:number){
         var layer:PowTileLayer = this.ctrl.tileMap.layers[this.ctrl.activeLayerIndex];
         if(!layer || !layer.tiles || index > layer.tiles.length || index < 0){
            return;
         }
         var action = new TileFloodPaintAction(layer,index,newGid);
         if(this.editor.actions.executeAction(action)){
            this.ctrl.setDebugText(action.name);
         }
      }
   }
}