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
/// <reference path="../formats/tiledFormat.ts"/>

module pow2.editor {

   declare var PIXI:any;

   /**
    * Map for Tiled editor format
    */
   export class TileMap {

      // ----------------------------------------------------------------------
      // SERVICE THIS AWAY.  Should be editable document format when returned.
      //
      map: pow2.editor.formats.tiled.TiledTMX;
      //
      // ----------------------------------------------------------------------

      tiles:any[] = []; // TODO: TilesetProperties
      bounds: pow2.Rect;
      private _loaded:boolean = false;
      private _layerLookup:{[name:string]:pow2.editor.formats.tiled.ITiledLayer} = {};

      constructor(
         public platform:IAppPlatform,
         public mapName: string = null) {
         this.bounds = new pow2.Rect(0, 0, 10,10);
      }

      reset(){
         this.bounds.point.set(0,0);
         this.bounds.extent.set(10,10);
         this.mapName = null;
         this.map = null;
         this.tiles.length = 0;
         this._layerLookup = {};
         this._loaded = false;
      }

      getLayer(name:string):pow2.editor.formats.tiled.ITiledLayer{
         if(!this._layerLookup[name]){
            this._layerLookup[name] = <pow2.editor.formats.tiled.ITiledLayer>_.where(this.map.layers,{name:name})[0];
         }
         return this._layerLookup[name];
      }

      load(mapName:string=this.mapName,done?:(map:TileMap)=>any){
         this.platform.readFile(mapName,(data) => {
            this._layerLookup = {};
            var tiledDocument = new pow2.editor.formats.tiled.TiledTMX(this.platform,mapName,$(data));
            tiledDocument.prepare(() => {
               this.mapName = mapName;
               this.setMap(tiledDocument,done);
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

      setMap(map:pow2.editor.formats.tiled.TiledTMX,done?:(map:TileMap)=>any) {
         if (!map) {
            return false;
         }
         if(this.map){
            this.unloaded();
         }
         this.map = map;
         this.bounds = new pow2.Rect(0, 0, this.map.width, this.map.height);
         var idSortedSets:any = _.sortBy(this.map.tilesets, (o:TiledTSXResource) => {
            return o.firstgid;
         });
         this.tiles.length = 0;
         _.each(idSortedSets,(tiles:TiledTSXResource) => {
            while(this.tiles.length < tiles.firstgid){
               this.tiles.push(null);
            }
            this.tiles = this.tiles.concat(tiles.tiles);
         });
         this.loaded();
         done && done(this);
         return true;
      }

      getTerrain(layer:string, x:number, y:number) {
         var terrain:pow2.editor.formats.tiled.ITiledLayer = this.getLayer(layer);
         if (!this.map || !terrain || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         var tileIndex = terrain.data[terrainIndex];
         return this.tiles[tileIndex];
      }

      getTileGid(layer:string, x:number, y:number):number {
         var terrain:pow2.editor.formats.tiled.ITiledLayer = this.getLayer(layer);
         if (!this.map || !terrain || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         return terrain.data[terrainIndex];
      }

      getTileMeta(gid:number):pow2.editor.formats.tiled.ITileInstanceMeta {
         if(this.tiles.length <= gid){
            return null;
         }
         var source = _.find(this.map.tilesets,(t:pow2.editor.formats.tiled.TiledTSX) => {
            return t.hasGid(gid);
         });
         if(!source){
            return null;
         }
         return <pow2.editor.formats.tiled.ITileInstanceMeta>source.getTileMeta(gid);
      }

   }
}