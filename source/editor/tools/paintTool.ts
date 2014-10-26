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
///<reference path="../tileEditorTool.ts"/>
module pow2.editor {

   /**
    * Define a tool for painting tiles by changing their global texture id.
    */
   export class PaintTool extends TileEditorTool {
      paintAt(index:number,newGid:number){
         var layer:PowTileLayer = this.ctrl.tileMap.layers[this.ctrl.activeLayerIndex];
         if(!layer || !layer.tiles || index > layer.tiles.length || index < 0){
            return;
         }
         var action:IAction = null;
         if(newGid !== 0){
            var meta:ITileData = this.ctrl.tileMap.tileInfo[newGid];
            if(!meta){
               throw new Error(pow2.errors.INVALID_ITEM);
            }
            var tile:number = layer.tiles[index];
            if(tile === newGid){
               return;
            }
            action = new TilePaintAction(layer,index,newGid);
         }
         else {
            var tile:number = layer.tiles[index];
            if(tile === newGid){
               return;
            }
            action = new TilePaintAction(layer,index,0);
         }
         if(this.editor.actions.executeAction(action)){
            this.ctrl.setDebugText(action.name);
         }
      }
   }
}