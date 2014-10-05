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
///<reference path="../../../types/pixi/PIXI.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../shell/directives/documentView.ts"/>
///<reference path="../../shell/controllers/appController.ts"/>
///<reference path="../../services/actions.ts"/>
///<reference path="../../services/tasks.ts"/>
///<reference path="../../services/keys.ts"/>
///<reference path="../../formats/tiledMapLoader.ts"/>
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
                  var appController:AppController = angular.element($document[0].body).controller(null);
                  var canvasElement:ng.IAugmentedJQuery = angular.element(element[0].querySelector('.canvas'));
                  var debugText:any = null;
                  function setDebugText(text:string){
                     debugText.setText(text);
                  }
                  if(appController){
                     appController.editMenuTemplateUrl = "source/editor/directives/layersListView.html";
                     appController.editor = tileEditor;
                  }
                  if(!documentViewController){
                     console.log("No DocumentViewController found for editor.  Some loading information will be unavailable.");
                  }


                  angular.element(window).on('resize',()=>{
                     tileEditor.resize(canvasElement.width(),canvasElement.height());
                  });

                  var t:pow2.editor.PowTileMap = null;

                  // create an new instance of a pixi stage
                  var stage = new PIXI.Stage(clearColor, true);
                  tileEditor.init(canvasElement,stage);

                  var newUrl:string = $platform.pathAsAppProtocol(source(scope));

                  // Unwatch progress interval
                  var unwatchProgress:any = null;

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
                     promise.then((tileMap:PowTileMap)=>{
                        tileEditor.setMap(tileMap);
                        t = <any>tileMap;//TODO: this cast should go away.
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


                  var buildMapRender = () => {
                     tileEditor.cameraCenter.set(t.size.x * t.tileSize.x / 2, t.size.y * t.tileSize.y / 2);
                     tileEditor.cameraHeight = element.height();
                     tileEditor.cameraWidth = element.width();
                     tileEditor.cameraZoom = 1;
                     tileEditor.updateCamera();

                     $platform.setTitle(newUrl);
                     var spriteTextures:{
                        [url:string]:any // PIXI.BaseTexture
                     } = tileEditor.loadTextures(t.tileSets);


                     // Each layer
                     tileEditor.clearViewLayers();
                     angular.forEach(t.layers,(mapLayer:pow2.editor.PowTileLayer,index:number) => {
                        $tasks.add(() => {
                           if(documentViewController){
                              documentViewController.setLoadingDetails(mapLayer.name);
                           }
                           tileEditor.newViewLayer(index,mapLayer);
                           return true;
                        },t.name);
                     });

                     stage.addChild(tileEditor.sceneContainer);

                     var total:number = $tasks.getRemainingTasks(t.name);
                     if(documentViewController){
                        documentViewController.setLoadingTitle("Building Map...");
                        documentViewController.setTotal(total);
                     }
                     // Kill any existing interval and register a new one.
                     $interval.cancel(unwatchProgress);
                     unwatchProgress = $interval(()=>{
                        if(documentViewController){
                           documentViewController.setCurrent(total - $tasks.getRemainingTasks(t.name));
                        }
                     },50);

                     $tasks.add(() => {
                        if(documentViewController){
                           documentViewController.hideLoading();
                        }
                        $interval.cancel(unwatchProgress);
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

                  return scope.$on("$destroy", function() {
                     tileEditor.destroy();
                     tileEditor.off('debug',setDebugText);
                     destroyStage(stage);
                     $interval.cancel(unwatchProgress);
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
