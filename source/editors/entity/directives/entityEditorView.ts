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
                  var d:IEntityData = data[1];

                  //-0---------------------
                  var graph:joint.dia.Graph = new joint.dia.Graph();
                  var paper:joint.dia.Paper = new joint.dia.Paper({
                     el: $(element),
                     width: element.width(),
                     height: element.height(),
                     gridSize: 1,
                     model: graph,
                     snapLinks: true,
                     defaultLink: new joint.shapes.pow2.Link,
                     interactive: (cellView) => {
                        if (cellView.model instanceof joint.shapes.pow2.ComponentModel) {
                           return false;
                        }
                        return true;
                     }
                  });

                  var connect = function(source, sourcePort, target, targetPort) {
                     var link = new joint.shapes.pow2.Link({
                        source: { id: source.id, selector: source.getPortSelector(sourcePort) },
                        target: { id: target.id, selector: target.getPortSelector(targetPort) },
                        //router: { name:'orthogonal' }
                     });
                     graph.addCell(link);
                  };

                  var compCount:number = _.keys(d.components).length;
                  var entityShape = new joint.shapes.pow2.EntityModel({
                     size: { width: 450, height: (compCount + 1) * 100 },
                     inPorts: _.keys(d.inputs),
                     outPorts: _.keys(d.outputs),
                     name:d.name,
                     objectType:d.type,
                  });
                  graph.addCell(entityShape);

                  var at:number = 0;
                  angular.forEach(d.components,(comp:IEntityComponentData,index:number)=>{
                     var compShape = new joint.shapes.pow2.ComponentModel({
                        size: { width: 350, height: 50 },
                        position: { x: 50, y: (at * 75) + 100 },
                        inPorts: ['host'],
                        outPorts: [],
                        name:comp.name,
                        objectType:comp.type
                     });
                     graph.addCell(compShape);
                     entityShape.embed(compShape);
                     //connect(entityShape,'host',compShape,'host');
                     at++;
                  });

                  //joint.layout.DirectedGraph.layout(graph, {
                  //   nodeSep: 20,
                  //   edgeSep: 20,
                  //   rankSep:20,
                  //   rankDir: "LR"
                  //});
                  var layoutPadding:number = 50;
                  angular.element(window).on('resize',()=>{
                     paper.setDimensions(element.width(),element.height());
                     paper.scaleContentToFit({
                        padding:layoutPadding
                     });
                  });
                  paper.scaleContentToFit({
                     padding:layoutPadding
                  });
               });
            };
            scope.$watch(attrs.url,setUrl);
         }
      };
   }]);
}