/**
 Copyright (C) 2013 by Justin DuJardin

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

/// <reference path="../interfaces/ITiledMap.ts"/>

module pow2.editor.tiled {

   export class TiledLoader {
      constructor(public platform:IAppPlatform, public data:JQuery){}
   }
   
   
   export class TiledTMX extends TiledLoader {
      $map:JQuery; // The <map> element
      width:number = 0;
      height:number = 0;
      orientation:string = "orthogonal";
      tileheight:number = 16;
      tilewidth:number = 16;
      version:number = 1;
      properties:any = {};
      tilesets:any = {};
      layers:any[] = [];
      objectGroups:any[] = [];

      constructor(
         public platform:IAppPlatform,
         public mapName:string,
         public data:JQuery){
         super(platform,data);
      }


      prepare(done:(res:TiledTMX)=>any) {
         this.$map = getRootNode(this.data,'map');
         this.version = parseInt(getElAttribute(this.$map,'version'));
         this.width = parseInt(getElAttribute(this.$map,'width'));
         this.height = parseInt(getElAttribute(this.$map,'height'));
         this.orientation = getElAttribute(this.$map,'orientation');
         this.tileheight = parseInt(getElAttribute(this.$map,'tileheight'));
         this.tilewidth = parseInt(getElAttribute(this.$map,'tilewidth'));
         this.properties = tiled.readTiledProperties(this.$map);
         var tileSetDeps = [];
         var tileSets = getChildren(this.$map,'tileset');
         _.each(tileSets,(ts) => {
            var source:string = getElAttribute(ts,'source');
            if(source){
               tileSetDeps.push({
                  source:this.platform.getDirName(this.mapName) + '/' + source,
                  firstgid:parseInt(getElAttribute(ts,'firstgid') || "-1")
               });
            }
            // TODO: IF no source then create a resource with the given data.
         });

         // Extract tile <layer>s
         var layers = getChildren(this.$map,'layer');
         _.each(layers,(layer) => {
            var tileLayer = <tiled.ITiledLayer>tiled.readITiledLayerBase(layer);
            this.layers.push(tileLayer);

            // Take CSV and convert it to JSON array, then parse.
            var data:any = getChild(layer,'data');
            if(data){
               var encoding:string = getElAttribute(data,'encoding');
               if(!encoding || encoding.toLowerCase() !== 'csv'){
                  throw new Error("Pow2 only supports CSV maps.  Edit the Map Properties in Tiled to use the CSV option when saving.");
               }
               tileLayer.data = JSON.parse('[' + $.trim(data.text()) + ']');
            }
         });

         // Extract tile <objectgroup>s
         var objectGroups = getChildren(this.$map,'objectgroup');
         _.each(objectGroups,($group) => {

            // Base layer properties.
            var objectGroup = <tiled.ITiledObjectGroup>tiled.readITiledLayerBase($group);
            objectGroup.objects = [];
            var color:string = getElAttribute($group,'color');
            if(color){
               objectGroup.color = color;
            }
            // Read any objects
            var objects = getChildren($group,'object');
            _.each(objects,(object) => {
               objectGroup.objects.push(<tiled.ITiledObject>tiled.readITiledLayerBase(object));
            });
            this.objectGroups.push(objectGroup);
         });


         // Load any source references.
         var _next = ():any => {
            if(tileSetDeps.length <= 0){
               return done(this);
            }
            var dep = tileSetDeps.shift();
            return this.platform.readFile(dep.source,(tsr:TiledTSX) => {
               this.tilesets[tsr.name] = tsr;
               tsr.firstgid = dep.firstgid;
               _next();
            });
         };
         _next();
      }
   }


   export class TilesetTile {
      id:number;
      properties:any = {};
      constructor(id:number){
         this.id = id;
      }
   }
   /**
    * A Tiled TSX tileset resource
    */
   export class TiledTSX extends TiledLoader {
      name:string = null;
      tilewidth:number = 16;
      tileheight:number = 16;
      imageWidth:number = 0;
      imageHeight:number = 0;
      image:ImageResource = null;
      firstgid:number = -1;
      tiles:any[] = [];

      prepare(done:(res:TiledTSX)=>any) {
         var tileSet = getRootNode(this.data,'tileset');
         this.name = getElAttribute(tileSet,'name');
         this.tilewidth = parseInt(getElAttribute(tileSet,'tilewidth'));
         this.tileheight = parseInt(getElAttribute(tileSet,'tileheight'));

         // Load tiles and custom properties.
         var tiles = getChildren(tileSet,'tile');
         _.each(tiles, (ts:any) => {
            var id:number = parseInt(getElAttribute(ts,'id'));
            var tile: TilesetTile = new TilesetTile(id);
            tile.properties = tiled.readTiledProperties(ts);
            this.tiles.push(tile);
         });

         var image = getChild(tileSet,'img');
         if(image && image.length > 0){
            var source = getElAttribute(image,'source');
            this.imageWidth = parseInt(getElAttribute(image,'width') || "0");
            this.imageHeight = parseInt(getElAttribute(image,'height') || "0");
            console.log("Tileset source: " + source);
            this.platform.readFile(source,(res:ImageResource) => {
               this.image = res;
               if(!res.isReady()){
                  throw new Error("Failed to load required TileMap image: " + source)
               }

               this.imageWidth = this.image.data.width;
               this.imageHeight = this.image.data.height;

               // Finally, build an expanded tileset from the known image w/h and the
               // tiles with properties that are specified in the form of <tile> objects.
               var xUnits = this.imageWidth / this.tilewidth;
               var yUnits = this.imageHeight / this.tileheight;
               var tileCount = xUnits * yUnits;
               var tileLookup = new Array(tileCount);
               for(var i = 0; i < tileCount; i++){
                  tileLookup[i] = false;
               }
               _.each(this.tiles,(tile) => {
                  tileLookup[tile.id] = tile.properties;
               });
               // TODO: uh-oh overwriting tiles...?
               this.tiles = tileLookup;

               done(this);
               //console.log(this);
            });
         }
         else {
            done(this);
         }
      }

      hasGid(gid:number):boolean {
         return this.firstgid !== -1
            && gid >= this.firstgid
            && gid < this.firstgid + this.tiles.length;
      }

      getTileMeta(gidOrIndex:number):ITileMeta {
         var index:number = this.firstgid !== -1 ? (gidOrIndex - (this.firstgid)): gidOrIndex;
         var tilesX = this.imageWidth / this.tilewidth;
         var x = index % tilesX;
         var y = Math.floor((index - x) / tilesX);
         return _.extend(this.tiles[index] || {},{
            image: this.image,
            x:x * this.tilewidth,
            y:y * this.tileheight,
            width:this.tilewidth,
            height:this.tileheight
         });
      }
   }




   // Tiled object XML reading utilities.
   export function readITiledBase(el:JQuery):ITiledBase{
      return {
         name:getElAttribute(el,'name'),
         x:parseInt(getElAttribute(el,'x') || "0"),
         y:parseInt(getElAttribute(el,'y') || "0"),
         width:parseInt(getElAttribute(el,'width') || "0"),
         height:parseInt(getElAttribute(el,'height') || "0"),
         visible:parseInt(getElAttribute(el, 'visible') || "1") === 1 // 0 or 1
      };
   }

   export function readITiledLayerBase(el:JQuery) {
      // Base layer properties
      var result:ITiledLayerBase = <ITiledLayerBase>readITiledBase(el);
      // Layer opacity is 0-1
      result.opacity = parseInt(getElAttribute(el,'opacity') || "1");
      // Custom properties
      var props = readTiledProperties(el);
      if(props){
         result.properties = props;
      }
      return result;
   }

   export function readTiledProperties(el:JQuery){
      var propsObject:JQuery = getChild(el,'properties');
      if(propsObject && propsObject.length > 0){
         var properties = {};
         var props = getChildren(propsObject,'property');
         _.each(props,(p) => {
            var key = getElAttribute(p,'name');
            var value:any = getElAttribute(p,'value');

            // Do some horrible type guessing.
            if(typeof value === 'string'){
               var checkValue:any = value.toLowerCase();
               if(checkValue === 'true' || checkValue === 'false'){
                  value = checkValue === 'true';
               }
               else if(!isNaN((checkValue = parseFloat(value)))){
                  value = checkValue
               }
            }
            properties[key] = value;
         });
         return properties;
      }
      return null;
   }

   // XML Utilities

   export function getElTag(el:JQuery):string{
      if(el){
         var name:string = el.prop('tagName');
         if(name){
            return name.toLowerCase();
         }
      }
      return null;
   }

   export function getRootNode(el:JQuery,tag:string):JQuery{
      return $(_.find(el,function(d:any){
         return d.tagName && d.tagName.toLowerCase() === tag;
      }));
   }


   export function getChildren(el:JQuery,tag:string):JQuery[] {
      var list = el.find(tag);
      return _.compact(_.map(list,function(c){
         var child:JQuery = $(c);
         return child.parent()[0] !== el[0] ? null : child;
      }));
   }

   export function getChild(el:JQuery,tag:string):JQuery {
      return getChildren(el,tag)[0];
   }

   export function getElAttribute(el:JQuery, name:string){
      if(el){
         var attr = el.attr(name);
         if(attr){
            return attr;
         }
      }
      return null;
   }

}
