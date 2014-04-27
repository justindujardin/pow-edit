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


/// <reference path="../../assets/vendor/pow2/pow2.d.ts"/>
/// <reference path="../app.ts"/>
/// <reference path="./tiledLoader.ts"/>

module pow2.editor.tiled {

   declare var PIXI:any;

   export class TileMap {
      map: TiledTMX;
      tiles:any = []; // TODO: TilesetProperties
      bounds: pow2.Rect;
      private _loaded:boolean = false;

      constructor(
         public platform:IAppPlatform,
         public mapName: string = null) {
         this.bounds = new pow2.Rect(0, 0, 10,10);
      }

      load(mapName:string=this.mapName){
         this.platform.readFile(mapName,(data) => {
            var tiledDocument = new pow2.editor.tiled.TiledTMX(this.platform,this.mapName,$(data));
            tiledDocument.prepare(() => {
               this.mapName = mapName;
               this.setMap(tiledDocument);
            });
         });
      }

      isLoaded():boolean {
         return this._loaded;
      }

      loaded(){
         //this.scene.trigger("map:loaded",this);
         this._loaded = true;
      }

      unloaded(){
         //this.scene.trigger("map:unloaded",this);
         this._loaded = false;
      }

      setMap(map:TiledTMX) {
         if (!map) {
            return false;
         }
         if(this.map){
            this.unloaded();
         }
         this.map = map;
         this.bounds = new pow2.Rect(0, 0, this.map.width, this.map.height);
         var idSortedSets = _.sortBy(this.map.tilesets, (o:TiledTSXResource) => {
            return o.firstgid;
         });
         this.tiles.length = 0;
         _.each(idSortedSets,(tiles:TiledTSXResource) => {
            while(this.tiles.length < tiles.firstgid){
               this.tiles.push(null);
            }
            this.tiles = this.tiles.concat(tiles.tiles);
         });
         //this.features = _.where(this.map.objectGroups,{name:"Features"})[0] || [];
         this.loaded();
         return true;
      }

      getLayers():tiled.ITiledLayer[] {
         return this.map ? this.map.layers : [];
      }

      getLayer(name:string):tiled.ITiledLayer{
         return <tiled.ITiledLayer>_.where(this.map.layers,{name:name})[0];
      }

      getTerrain(layer:string, x:number, y:number) {
         var terrain:tiled.ITiledLayer = this.getLayer(layer);
         if (!this.map || !terrain || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         var tileIndex = terrain.data[terrainIndex];
         return this.tiles[tileIndex];
      }

      getTileGid(layer:string, x:number, y:number):number {
         var terrain:tiled.ITiledLayer = this.getLayer(layer);
         if (!this.map || !terrain || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         return terrain.data[terrainIndex];
      }

      getTileMeta(gid:number):ITileMeta {
         if(this.tiles.length <= gid){
            return null;
         }
         var source = _.find(this.map.tilesets,(t:TiledTSXResource) => {
            return t.hasGid(gid);
         });
         if(!source){
            return null;
         }
         return source.getTileMeta(gid);
      }

//      // TODO: Calculate texture with two array index lookups like in getTerrain.  No need for FN call here.
//      getTerrainTexture(x, y) {
//         var terrain = this.getTerrain("Terrain", x, y);
//         if (terrain) {
//            return terrain.icon;
//         } else {
//            return null;
//         }
//      }
   }
}