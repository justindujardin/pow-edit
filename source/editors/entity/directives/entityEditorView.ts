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
///<reference path="../entityEditorShapes.ts"/>

module pow2.editor {
   pow2.editor.app.directive('entityEditorView', ['$platform', ($platform:IAppPlatform) => {
      return {
         restrict: "E",
         replace: true,
         templateUrl: 'source/editors/entity/directives/entityEditorView.html',
         link:(scope,element,attrs) => {
            var setUrl = (url:string) => {
               if(!url){
                  return;
               }
               $platform.readFile(url,(data:any) => {
                  if(!data){
                     data = null;
                  }
                  scope.data = data;
                  scope.$$phase || scope.$digest();
                  try {
                     data = JSON.parse(data);
                  }
                  catch(e){
                     console.error(e);
                  }
                  var d:IEntityData = data[0];

                  //-0---------------------
                  var graph:joint.dia.Graph = new joint.dia.Graph();
                  var paper:joint.dia.Paper = new joint.dia.Paper({
                     el: $(element),
                     width: element.width(),
                     height: element.height(),
                     gridSize: 1,
                     model: graph,
                     snapLinks: true,
                     defaultLink: new joint.shapes.pow2.Link
                  });

                  var connect = function(source, sourcePort, target, targetPort) {
                     var link = new joint.shapes.pow2.Link({
                        source: { id: source.id, selector: source.getPortSelector(sourcePort) },
                        target: { id: target.id, selector: target.getPortSelector(targetPort) }
                     });
                     graph.addCell(link);
                  };

                  var compCount:number = _.keys(d.components).length;
                  var entityCoupling = new joint.shapes.pow2.Coupled({
                     size: { width: 300, height: compCount * 50 },
                     inPorts: _.keys(d.inputs),
                     outPorts: _.keys(d.outputs),
                     name:d.name,
                     objectType:d.type,
                  });
                  graph.addCell(entityCoupling);

                  var at:number = 0;
                  angular.forEach(d.components,(comp:IEntityComponentData,name:string)=>{
                     var compAtomic = new joint.shapes.pow2.Atomic({
                        size: { width: 350, height: 100 },
                        inPorts: ['host'],
                        outPorts: [],
                        name:name,
                        objectType:comp.type
                     });
                     graph.addCell(compAtomic);
                     entityCoupling.embed(compAtomic);
                     connect(entityCoupling,'host',compAtomic,'host');
                     at++;
                  });

                  joint.layout.DirectedGraph.layout(graph, {
                     nodeSep: 80,
                     edgeSep: 80,
                     rankSep:100,
                     rankDir: "LR"
                  });
                  angular.element(window).on('resize',()=>{
                     paper.setDimensions(element.width(),element.height());
                     paper.scaleContentToFit({
                        padding:50
                     });
                  });
                  paper.scaleContentToFit({
                     padding:50
                  });
               });
            };
            scope.$watch(attrs.url,setUrl);
         }
      };
   }]);
}