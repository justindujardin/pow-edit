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

///<reference path="./tileEditor.ts"/>
///<reference path="../interfaces/IPicker.ts"/>
///<reference path="../formats/powTileMap.ts"/>


module pow2.editor {

   export interface IPowTilePick {
      meta:ITileData;
      index:number;
      layer:PowTileLayer;
      layerIndex:number;
      gid:number;
   }

   export class PowTileMapPicker implements IPicker<IPowTilePick> {
      constructor(
         public map:PowTileMap) {
         if(!map){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
      }

      /**
       * Returns the index of the tile at a given position, or -1 if out of bounds.
       */
      indexFromPoint(point:pow2.Point):number {
         if(point.x < 0 || point.y < 0 || point.x >= this.map.size.x || point.y >= this.map.size.y){
            return -1;
         }
         var tileIndex:number = point.y * this.map.size.x + point.x;
         if(tileIndex >= 0 && tileIndex < (this.map.size.x * this.map.size.y)){
            return tileIndex;
         }
         return -1;
      }
      pickFirst(point:pow2.Point):IPowTilePick {
         var index:number = this.indexFromPoint(point);
         if(index == -1){
            return null;
         }
         for (var i:number = this.map.layers.length - 1; i >= 0; --i) {
            var layer:PowTileLayer = this.map.layers[i];
            if(!layer.tiles || !layer.visible){
               continue;
            }
            var gid:number = layer.tiles[index];
            if(gid > 0){
               return {
                  meta: this.map.tileInfo[gid],
                  index:index,
                  layer:layer,
                  layerIndex:i,
                  gid:gid
               };
            }
         }
         return null;
      }

      pickNext(point:pow2.Point, current:IPowTilePick):IPowTilePick {
         return undefined;
      }

      queryPoint(point:pow2.Point, results:IPowTilePick[]):boolean {
         return undefined;
      }

      queryRect(rect:pow2.Rect, results:IPowTilePick[]):boolean {
         return undefined;
      }

   }
}