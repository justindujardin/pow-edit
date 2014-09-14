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
///<reference path="../../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/pixi/PIXI.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/actions.ts"/>
///<reference path="../../services/tasks.ts"/>
///<reference path="../../services/keys.ts"/>
///<reference path="../../formats/TiledLoader.ts"/>
///<reference path="../controllers/tileEditorController.ts"/>

module pow2.editor {
   declare var requestAnimFrame:any;
   declare var PIXI:any;
   var clearColor:number = 0x111114;
   pow2.editor.app.directive("tileEditorView", [
      "$interval", "$parse","$document","$tasks","$platform",
      ($interval,$parse,$document,$tasks:TasksService,$platform:IAppPlatform) => {

         function destroyStage(stage) {
            if(stage){
               for (var i = stage.children.length - 1; i >= 0; i--) {
                  stage.removeChild(stage.children[i]);
               }
            }
         }

         return {
            restrict: "E",
            replace: false,
            templateUrl: "source/editor/directives/tileEditorView.html",
            require:["tileEditorView","?^documentView"],
            controller:TileEditorController,
            controllerAs:'editor',
            compile:(element,attributes) => {
               var source = $parse(attributes.url);

               return (scope, element, attributes:any,controllers:any[]) => {
                  var tileEditor:TileEditorController = controllers[0];
                  var documentViewController:DocumentViewController = controllers[1];
                  var appController:AppController = angular.element('body').controller();
                  var canvasElement:ng.IAugmentedJQuery = angular.element(element[0].querySelector('.canvas'));

                  if(appController){
                     appController.editorMenu = "source/editor/directives/layersListView.html";
                     appController.editor = tileEditor;
                  }
                  if(!documentViewController){
                     console.log("No DocumentViewController found for editor.  Some loading information will be unavailable.");
                  }


                  angular.element(window).on('resize',()=>{
                     tileEditor.resize(canvasElement.width(),canvasElement.height());
                  });

                  var t:pow2.editor.ITileMap = null;

                  tileEditor.init(canvasElement);
                  // create an new instance of a pixi stage
                  var stage = new PIXI.Stage(clearColor, true);
                  var newUrl:string = $platform.pathAsAppProtocol(source(scope));

                  /**
                   * Data binding
                   */
                  var updateView = (value) => {
                     newUrl = $platform.pathAsAppProtocol(source(scope));
                     if(!newUrl){
                        return;
                     }
                     if(t && t.name){
                        $tasks.killTaskGroup(t.name);
                     }

                     if(!value){
                        destroyStage(stage);
                        tileEditor.sceneContainer = null;
                        return;
                     }

                     if(tileEditor.sceneContainer){
                        destroyStage(stage);
                     }
                     tileEditor.sceneContainer = new PIXI.DisplayObjectContainer();
                     if(documentViewController){
                        documentViewController.showLoading('Loading...');
                     }
                     var promise:ng.IPromise<ITileMap> = tileEditor.loader.load(newUrl);
                     promise.then((tileMap:ITileMap)=>{
                        tileEditor.setMap(tileMap);
                        t = tileMap;
                        buildMapRender();
                     }).catch((e:any)=>{
                        console.error(e);
                     });
                  };
                  scope.$watch(attributes.url, updateView);



                  /**
                   * TODO: Map refactoring:
                   *
                   * - `pow2.editor.formats.tiled` references indicate coupling to Tiled format
                   *   and opportunity to decouple with accessor methods on editable document
                   *   class object.
                   *
                   */

                  // Layer lists
                  var debugText:any = null;
                  function setDebugText(text:string){
                     debugText.setText(text);
                  }
                  var buildMapRender = () => {
                     tileEditor.layers.length = 0;
                     tileEditor.cameraCenter.set(t.size.x * t.tileSize.x / 2, t.size.y * t.tileSize.y / 2);
                     tileEditor.cameraHeight = element.height();
                     tileEditor.cameraWidth = element.width();
                     tileEditor.cameraZoom = 1;
                     tileEditor.updateCamera();

                     $platform.setTitle(newUrl);
                     var spriteTextures:{
                        [url:string]:any // PIXI.BaseTexture
                     } = tileEditor.loadTextures(t.tileSets);


                     // Pre allocate display object containers.
                     angular.forEach(t.layers,(layer:any) => {
                        var container = new PIXI.DisplayObjectContainer();
                        tileEditor.layers.push(<IEditableTileLayer>{
                           tiles: new Array(layer.tiles ? layer.tiles.length : 0),
                           objects:container,
                           data:layer,
                           name:layer.name,
                           properties:layer.properties,
                           opacity:layer.opacity
                        });
                        container.visible = layer.visible;
                        tileEditor.sceneContainer.addChild(container);
                     });

                     // Each layer
                     angular.forEach(t.layers,(l:pow2.editor.ITileLayer,index:number) => {
                        $tasks.add(() => {
                           if(documentViewController){
                              documentViewController.setLoadingDetails(l.name);
                           }
                           var editable:IEditableTileLayer = tileEditor.layers[index];
                           var container = editable.objects;
                           if(l.tiles){
                              for(var col:number = 0; col < t.size.x; col++) {
                                 for (var row:number = 0; row < t.size.y; row++) {
                                    // y * w + x = tile id from col/row
                                    var tileIndex:number = row * t.size.x + col;
                                    var gid:number = l.tiles[tileIndex];
                                    var meta:ITileData = t.tileInfo[gid];
                                    if (meta) {
                                       var frame = new PIXI.Rectangle(meta.imagePoint.x,meta.imagePoint.y,t.tileSize.x,t.tileSize.y);
                                       var texture = new PIXI.Texture(spriteTextures[meta.url],frame);
                                       var tile:EditableTile = new EditableTile(tileEditor,texture);
                                       tile.sprite.x = col * t.tileSize.y;
                                       tile.sprite.y = row * t.tileSize.x;
                                       tile.sprite.width = t.tileSize.x;
                                       tile.sprite.height = t.tileSize.y;
                                       tile._gid = gid;
                                       tile._tileIndex = tileIndex;

                                       //sprite.anchor = centerOrigin;
                                       container.addChild(tile.sprite);
                                       editable.tiles[tileIndex] = tile;
                                    }
                                 }
                              }
                           }
                           _.each(l.objects,(obj:pow2.tiled.ITiledObject) => {
                              var box = new PIXI.Graphics();
                              box.beginFill(0xFFFFFF);
                              box.alpha = 0.6;
                              box.lineStyle(1,0xAAAAAA,1);
                              box.drawRect(0, 0, obj.width, obj.height);
                              box.endFill();
                              box.position.x = obj.x;
                              box.position.y = obj.y;
                              container.addChild(box);
                           });
                           return true;
                        },t.name);
                     });

                     stage.addChild(tileEditor.sceneContainer);

                     var total:number = $tasks.getRemainingTasks(t.name);
                     if(documentViewController){
                        documentViewController.setLoadingTitle("Building Map...");
                        documentViewController.setTotal(total);
                     }
                     tileEditor.unwatchProgress = $interval(()=>{
                        if(documentViewController){
                           documentViewController.setCurrent(total - $tasks.getRemainingTasks(t.name));
                        }
                     },50);

                     $tasks.add(() => {
                        if(documentViewController){
                           documentViewController.hideLoading();
                        }
                        $interval.cancel(tileEditor.unwatchProgress);
                        tileEditor.resize(canvasElement.width(),canvasElement.height());
                        scope.$emit('map-loaded');
                        return true;
                     },t.name);
                     // Debug map stats
                     var stats:string = [
                           'Layers: ' + t.layers.length,
                           'Size: ' + t.size
                     ].join('\n');
                     debugText = new PIXI.Text(stats, {
                        font:"16px courier",
                        fill:"white",
                        stroke:"black",
                        strokeThickness:3
                     });
                     debugText.x = 75;
                     debugText.y = 10;
                     stage.addChild(debugText);
                     tileEditor.on('debug',setDebugText);
                  };

                  element.on('mousedown touchstart',(e)=>{
                     tileEditor.handleMouseDown(e);
                  });
                  element.on("mousewheel DOMMouseScroll MozMousePixelScroll",(e)=>{
                     tileEditor.handleMouseWheel(e);
                  });

                  var scopeDestroyed:boolean = false;
                  /**
                   * Process loop
                   */
                  function animate() {
                     tileEditor.renderer.render(stage);
                     if(!scopeDestroyed){
                        requestAnimFrame(animate);
                     }
                  }
                  requestAnimFrame(animate);
                  return scope.$on("$destroy", function() {
                     tileEditor.destroy();
                     tileEditor.off('debug',setDebugText);
                     scopeDestroyed = true;
                     destroyStage(stage);
                     $interval.cancel(tileEditor.unwatchProgress);
                     if(t){
                        $tasks.killTaskGroup(t.name);
                     }
                     t = null;
                     if(documentViewController){
                        documentViewController.hideLoading();
                     }
                     if(appController){
                        appController.editor = null;
                     }
                     angular.element(window).off('resize');
                  });
               };
            }
         };
      }
   ]);
}
