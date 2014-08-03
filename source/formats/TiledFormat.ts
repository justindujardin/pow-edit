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

/// <reference path="../../bower_components/pow-core/lib/pow-core.d.ts"/>
/// <reference path="../interfaces/ITileMap.ts"/>
/// <reference path="../interfaces/IMapLoader.ts"/>

module pow2.editor {

   export class TiledMapLoader implements IMapLoader {
      static $inject:string[] = ['$q','$platform'];
      constructor(
         public $q:ng.IQService,
         public $platform:IAppPlatform){
      }

      load(location:string, data:any):ng.IPromise<ITileMap> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();
         var tiledDocument = new pow2.editor.formats.tiled.TiledTMX(this.$platform,location,$(data));
         tiledDocument.prepare(() => {
            var result:ITileMap = {
               size:new pow2.Point(tiledDocument.width,tiledDocument.height),
               point:new pow2.Point(0,0),
               tileSize:new pow2.Point(tiledDocument.tilewidth,tiledDocument.tileheight),
               layers:_.map(tiledDocument.layers,(l:pow2.editor.formats.tiled.ITiledLayer)=>{
                  return <ITileLayer>{
                     tiles:l.data,
                     objects:l.objects,
                     size:new pow2.Point(l.width,l.height),
                     name:l.name,
                     point:new pow2.Point(l.x,l.y),
                     visible:l.visible,
                     opacity:l.opacity
                  }
               }),
               tileSets:[],
               tileInfo:[],
               name:tiledDocument.mapName
            };

            var idSortedSets:any = _.sortBy(tiledDocument.tilesets, (o:pow2.TiledTSXResource) => {
               return o.firstgid;
            });
            _.each(idSortedSets,(tiles:TiledTSXResource) => {
               while(result.tileInfo.length < tiles.firstgid){
                  result.tileInfo.push(null);
               }
               var mapTiles:ITileData[] = _.map(tiles.tiles,(t:any,index:number) => {
                  var tilesX = tiles.imageWidth / tiles.tilewidth;
                  var x = index % tilesX;
                  var y = Math.floor((index- x) / tilesX);
                  return <ITileData>{
                     url:tiles.url,
                     image:tiles.image.data,
                     imageSize:new pow2.Point(tiles.imageWidth,tiles.imageHeight),
                     imagePoint:new pow2.Point(x * tiles.tilewidth,y * tiles.tileheight),
                     properties: t
                  };
               });
               result.tileInfo = result.tileInfo.concat(mapTiles);
            });

            _.each(tiledDocument.tilesets,(tsr:pow2.editor.formats.tiled.TiledTSX) => {

               result.tileSets.push({
                  tileSize:new pow2.Point(tsr.tilewidth,tsr.tileheight),
                  tiles:tsr.tiles,
                  url:tsr.url,
                  image:tsr.image,
                  firstIndex:tsr.firstgid,
                  imageSize:new pow2.Point(tsr.imageWidth,tsr.imageHeight),
                  name:tsr.name
               });
            });

            deferred.resolve(result);
         });

         return deferred.promise;
      }

      save(location:string, data:ITileMap):ng.IPromise<ITileMap> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();

         return deferred.promise;
      }

   }
}

module pow2.editor.formats.tiled {

   // -------------------------------------------------------------------------
   // Implement a subset of the Tiled editor format:
   //
   // https://github.com/bjorn/tiled/wiki/TMX-Map-Format

   export interface ITileInstanceMeta {
      image: HTMLImageElement;
      url: string;
      x: number;
      y: number;
      width: number;
      height: number;
      data?: any;
   }
   export interface ITiledBase {
      name:string;
      x:number;
      y:number;
      width:number;
      height:number;
      visible:boolean;
   }
   // <layer>, <objectgroup>
   export interface ITiledLayerBase extends ITiledBase {
      opacity:number; // 0-1
      properties?:any;
   }
   export interface ITiledLayer extends ITiledLayerBase {
      data?:any;
      color?:string;
      objects?:ITiledObject[];
   }

   // <object>
   export interface ITiledObject extends ITiledBase {
      properties?:any;
      rotation?:number;
      type?:string;
      gid?:number;
   }

   // -------------------------------------------------------------------------
   export class TiledLoader {
      data:JQuery;
      constructor(
         public platform:IAppPlatform,
         public mapName:string,
         data:JQuery){
         this.data = $(data);
      }
   }

   interface TileSetDependency {
      source?:string; // Path to URL source from which to load data.
      data?:any; // Data instead of source.
      firstgid:number; // First global id.
   }



   /////////////////////////////////////////////////////////////////

   // TMX Map:  some properties, (n) tilesets, (n) layers, (n) object groups.
   export class TiledTMX extends TiledLoader {
      $map:JQuery; // The <map> element
      width:number = 0;
      height:number = 0;
      orientation:string = "orthogonal";
      tileheight:number = 16;
      tilewidth:number = 16;
      version:number = 1;
      properties:any = {};
      tilesets:TiledTSX[] = [];
      layers:any[] = [];
      objectGroups:any[] = [];
      prepare(done:(res:TiledTMX)=>any) {
         this.$map = getRootNode(this.data,'map');
         this.version = parseInt(getElAttribute(this.$map,'version'));
         this.width = parseInt(getElAttribute(this.$map,'width'));
         this.height = parseInt(getElAttribute(this.$map,'height'));
         this.orientation = getElAttribute(this.$map,'orientation');
         this.tileheight = parseInt(getElAttribute(this.$map,'tileheight'));
         this.tilewidth = parseInt(getElAttribute(this.$map,'tilewidth'));
         this.properties = tiled.readTiledProperties(this.$map);
         var tileSetDeps:TileSetDependency[] = [];
         var tileSets = getChildren(this.$map,'tileset');
         _.each(tileSets,(ts) => {
            var source:string = getElAttribute(ts,'source');
            if(source){
               tileSetDeps.push({
                  source:this.platform.getDirName(this.mapName) + '/' + source,
                  firstgid:parseInt(getElAttribute(ts,'firstgid') || "-1")
               });
            }
            // Tileset element is inline, load from the existing XML and
            // assign the source (used for relative image loading) to be
            // the .tmx file.
            else {
               tileSetDeps.push({
                  data:ts,
                  source:this.mapName,
                  firstgid:parseInt(getElAttribute(ts,'firstgid') || "-1")
               })
            }
         });

         // Extract tile <layer>s and <objectgroup>s
         var layers = getChildren(this.$map,'layer,objectgroup');
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

            // Any custom color for this layer?
            var color:string = getElAttribute(layer,'color');
            if(color){
               tileLayer.color = color;
            }

            // Read any child objects
            var objects = getChildren(layer,'object');
            if(objects){
               tileLayer.objects = [];
               _.each(objects,(object) => {
                  tileLayer.objects.push(<tiled.ITiledObject>tiled.readITiledLayerBase(object));
               });
            }
         });


         // Load any source references.
         var _next = ():any => {
            if(tileSetDeps.length <= 0){
               return done(this);
            }
            var dep = tileSetDeps.shift();
            var loadTileset = (data:any) => {
               var tsr:TiledTSX = new TiledTSX(this.platform,dep.source,data);
               tsr.prepare(() => {
                  this.tilesets.push(tsr);
                  tsr.firstgid = dep.firstgid;
                  _next();
               });
            };
            if(dep.data) {
               loadTileset(dep.data);
            }
            else if(dep.source){
               this.platform.readFile(dep.source,(data:any) => {
                  loadTileset(data);
               });
            }
            else {
               throw new Error("Unknown type of tile set data");
            }
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
      image:HTMLImageElement = null;
      url:string;
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
            var reference:HTMLImageElement = document.createElement('img');
            reference.onload = () => {

               this.image = reference;
               this.imageWidth = this.image.width;
               this.imageHeight = this.image.height;

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
               this.tiles = tileLookup;
               done(this);
            };
            reference.onerror = (err:any) => {
               console.error("Failed to load image: " + err);
               done(this);
            };
            this.url = reference.src = this.platform.getMountPath(this.platform.getDirName(this.mapName) + '/' + source);
            console.log("Tileset source: " + reference.src);
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

      getTileMeta(gidOrIndex:number):ITileInstanceMeta {
         var index:number = this.firstgid !== -1 ? (gidOrIndex - (this.firstgid)): gidOrIndex;
         var tilesX = this.imageWidth / this.tilewidth;
         var x = index % tilesX;
         var y = Math.floor((index - x) / tilesX);
         return _.extend(this.tiles[index] || {},{
            image: this.image,
            url:this.url,
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
