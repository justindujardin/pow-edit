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
/// <reference path="../app.ts"/>

module pow2.editor {

   export class PowTileLayer extends pow2.Events implements ITileLayer {
      static TYPES:any = {
         LAYER:"layer",
         OBJECTGROUP:"objectgroup"
      };
      static EVENTS:any = {
         CHANGE_TILE: 'change:tile',
         CHANGE_VISIBLE: 'change:visible'
      };
      // ITileLayer
      point:pow2.Point;
      size:pow2.Point;
      tiles:number[];
      properties:{
         [name:string]:any
      };
      visible:boolean;
      opacity:number;
      objects:any[];
      name:string;
      // end ITileLayer
      constructor(public type:string){
         super();
         switch(type){
            case PowTileLayer.TYPES.LAYER:
               this.tiles = [];
               break;
            case PowTileLayer.TYPES.OBJECTGROUP:
               this.objects = [];
               break;
            default:
               throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
      }

      setSize(size:pow2.Point){
         if(!size || size.isZero()){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         this.size = size;
         this.tiles = <number[]>Array.apply(null, new Array(size.x * size.y)).map(Number.prototype.valueOf,0);
      }

      setTileGid(index:number,gid:number){
         if(index < 0 || index > this.tiles.length || gid < 0){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         this.tiles[index] = gid;
         this.trigger(PowTileLayer.EVENTS.CHANGE_TILE,index);
      }

      toggleVisible() {
         this.visible = !this.visible;
         this.trigger(PowTileLayer.EVENTS.CHANGE_VISIBLE,this.visible);
      }
   }

   export class PowTileMap extends pow2.Events implements ITileMap {
      tileInfo:pow2.editor.ITileData[] = [];
      tileSets:pow2.editor.ITileSet[] = [];
      layers:pow2.editor.PowTileLayer[] = [];
      point:pow2.Point = new pow2.Point(0,0);
      size:pow2.Point = new pow2.Point(1,1);
      tileSize:pow2.Point = new pow2.Point(16,16);
      name:string = "Untitled";
      static EVENTS:any = {
         ADD_LAYER: 'layer:add',
         REMOVE_LAYER: 'layer:remove'
      };
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
      getLayer(index:number):PowTileLayer{
         if(index < 0 || index > this.layers.length){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         return <PowTileLayer>this.layers[index];
      }
      addLayer(layer:PowTileLayer){
         this.insertLayer(this.layers.length,layer);
      }
      insertLayer(index:number,layer:PowTileLayer){
         if(!layer || !layer.size){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         this.layers.splice(index,0,layer);
         this.trigger(PowTileMap.EVENTS.ADD_LAYER,layer,index);
      }
      removeLayer(index:number){
         if(index < 0 || index > this.layers.length){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         var layer:PowTileLayer = this.layers[index];
         this.layers.splice(index,1);
         this.trigger(PowTileMap.EVENTS.REMOVE_LAYER,layer,index);

      }
   }
}
