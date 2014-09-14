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
/// <reference path="./powTileMap.ts"/>
/// <reference path="../interfaces/IMapLoader.ts"/>

module pow2.editor {

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
//                  (<ITileData>{
//                     url:null,
//                     image:null,
//                     imageSize:new pow2.Point(-1,-1),
//                     imagePoint:new pow2.Point(-1,-1),
//                     properties: {}
//                  });
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
               result.addLayer({
                  tiles:l.data,
                  container:new PIXI.DisplayObjectContainer(),
                  objects:l.objects,
                  properties:{},
                  size:new pow2.Point(l.width,l.height),
                  name:l.name,
                  point:new pow2.Point(l.x,l.y),
                  visible:l.visible,
                  opacity:l.opacity
               });
            });

            deferred.resolve(result);
            this.$rootScope.$$phase || this.$rootScope.$digest();

         });

         return deferred.promise;
      }

      save(location:string, data:ITileMap):ng.IPromise<ITileMap> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();

         return deferred.promise;
      }

   }
}
