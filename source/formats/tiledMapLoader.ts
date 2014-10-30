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

/// <reference path="../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
/// <reference path="./powTileMap.ts"/>
/// <reference path="../interfaces/IMapLoader.ts"/>

module pow2.editor {

   declare var vkbeautify:any;


   export function PowLayerToTiledLayer(layer:PowTileLayer):pow2.tiled.ITiledLayer {
      var result:pow2.tiled.ITiledLayer = {
         opacity:layer.opacity,
         name: layer.name,
         x: layer.point.x,
         y: layer.point.y,
         width: layer.size.x,
         height: layer.size.y,
         visible: layer.visible
      };
      switch(layer.type){
         case PowTileLayer.TYPES.LAYER:
            result.data = layer.tiles;
            break;
         case PowTileLayer.TYPES.OBJECTGROUP:
            result.objects = layer.objects;
            break;
      }
      return result;
   }

   export function TiledLayerToPowLayer(layer:pow2.tiled.ITiledLayer):pow2.editor.PowTileLayer {
      // TODO: more robust type detection?  What about if tiles is undefined, and layers is also undefined?
      var type:string = typeof layer.data !== 'undefined' ? PowTileLayer.TYPES.LAYER : PowTileLayer.TYPES.OBJECTGROUP;
      var powLayer:PowTileLayer = new PowTileLayer(type);
      _.extend(powLayer,{
         tiles:layer.data,
         objects:layer.objects,
         properties:{},
         size:new pow2.Point(layer.width,layer.height),
         name:layer.name,
         point:new pow2.Point(layer.x,layer.y),
         visible:layer.visible,
         opacity:layer.opacity
      });
      return powLayer;
   }

   export class TiledMapLoader implements IMapLoader {
      static $inject:string[] = ['$q','$rootScope'];
      constructor(
         public $q:ng.IQService,
         public $rootScope:any){
      }

      load(location:string):ng.IPromise<ITileMap> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();
         pow2.ResourceLoader.get().load(location,(tiledResource?: pow2.TiledTMXResource)=>{
            if(!tiledResource.isReady()){
               deferred.reject("Failed to load file");
               this.$rootScope.$$phase || this.$rootScope.$digest();
               return;
            }
            var result:PowTileMap = new PowTileMap();
            result.setName(location);
            result.setSize(new pow2.Point(tiledResource.width,tiledResource.height));
            result.setPoint(new pow2.Point(0,0));
            result.setTileSize(new pow2.Point(tiledResource.tilewidth,tiledResource.tileheight));

            // Add listing of referenced tile sets
            var idSortedSets:any = _.sortBy(tiledResource.tilesets, (o:pow2.TiledTSXResource) => {
               return o.firstgid;
            });
            angular.forEach(idSortedSets,(tsxRes:TiledTSXResource) => {
               while(result.tileInfo.length < tsxRes.firstgid){
                  result.tileInfo.push(null);
               }
               angular.forEach(tsxRes.tiles,(t:any,index:number) => {
                  var tilesX = tsxRes.imageWidth / tsxRes.tilewidth;
                  var x = index % tilesX;
                  var y = Math.floor((index- x) / tilesX);
                  result.tileInfo.push(<ITileData>{
                     url:tsxRes.imageUrl,
                     image:tsxRes.image.data,
                     imageSize:new pow2.Point(tsxRes.imageWidth,tsxRes.imageHeight),
                     imagePoint:new pow2.Point(x * tsxRes.tilewidth,y * tsxRes.tileheight),
                     properties: t
                  });
               });
            });
            angular.forEach(tiledResource.tilesets,(tsr:pow2.TiledTSXResource) => {
               result.tileSets.push({
                  tileSize:new pow2.Point(tsr.tilewidth,tsr.tileheight),
                  tiles:tsr.tiles,
                  url:tsr.imageUrl,
                  image:tsr.image.data,
                  firstIndex:tsr.firstgid,
                  imageSize:new pow2.Point(tsr.imageWidth,tsr.imageHeight),
                  name:tsr.name
               });
            });

            // Add layers last
            angular.forEach(tiledResource.layers,(l:pow2.tiled.ITiledLayer)=>{
               result.addLayer(TiledLayerToPowLayer(l));
            });

            deferred.resolve(result);
            this.$rootScope.$$phase || this.$rootScope.$digest();

         });

         return deferred.promise;
      }

      save(location:string, data:ITileMap):ng.IPromise<any> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();
         pow2.ResourceLoader.get().load(location,(tiledResource?: pow2.TiledTMXResource)=>{
            if(!tiledResource.isReady()){
               deferred.reject("Failed to load file");
               this.$rootScope.$$phase || this.$rootScope.$digest();
               return;
            }
            tiledResource.layers = data.layers.map((l:PowTileLayer)=>{
               return PowLayerToTiledLayer(l);
            });
            var out:any = tiledResource.write();
            deferred.resolve(vkbeautify.xml(out,2));
            this.$rootScope.$$phase || this.$rootScope.$digest();

         });
         return deferred.promise;
      }

   }
}
