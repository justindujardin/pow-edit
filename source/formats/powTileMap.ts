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

/// <reference path="../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
/// <reference path="../interfaces/ITileMap.ts"/>

module pow2.editor {

   export class PowTileMap implements ITileMap {
      tileInfo:pow2.editor.ITileData[] = [];
      tileSets:pow2.editor.ITileSet[] = [];
      layers:pow2.editor.ITileLayer[] = [];
      point:pow2.Point = new pow2.Point(0,0);
      size:pow2.Point = new pow2.Point(1,1);
      tileSize:pow2.Point = new pow2.Point(16,16);
      name:string = "Untitled";
      private _blank:PIXI.Texture = new PIXI.RenderTexture(16, 16);
      setName(location:string) {
         this.name = location;
      }
      setSize(size:pow2.Point) {
         this.size = size.clone();
      }
      setPoint(at:pow2.Point){
         this.point = at.clone();
      }
      setTileSize(size:pow2.Point){
         this.tileSize = size.clone();
      }
      addLayer(layer:ITileLayer){
         if(!layer || !layer.size){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         var arraySize:number = layer.size.x * layer.size.y;
         if(!layer.container){
            layer.container = new PIXI.DisplayObjectContainer();
         }
         var gids:any[] = layer.tiles;
         if(!angular.isArray(layer.tiles)) {
            gids = new Array(arraySize).map(()=>{
               return 0;
            });
         }
         for(var col:number = 0; col < layer.size.x; col++) {
            for (var row:number = 0; row < layer.size.y; row++) {
               var tileIndex:number = row * layer.size.x + col;
               // y * w + x = tile id from col/row
               var gid:number = gids[tileIndex];
               var tile:EditableTile = new EditableTile(this._blank);
               tile.sprite.x = col * this.tileSize.y;
               tile.sprite.y = row * this.tileSize.x;
               tile.sprite.width = this.tileSize.x;
               tile.sprite.height = this.tileSize.y;
               tile._gid = gid;
               tile._tileIndex = tileIndex;

               //sprite.anchor = centerOrigin;
               gids[tileIndex] = tile;
            }
         }
         layer.tiles = <any>gids;
         this.layers.push(layer);
      }
   }
}
