///<reference path="../../../../types/angular/angular.d.ts"/>
///<reference path="../../../app.ts"/>


interface IEntityComponentData {
   type:string;
   inputs:string[];
   outputs:string[];
}
interface IEntityData extends IEntityComponentData {
   name:string;
   components:{
      [name:string]:IEntityComponentData
   };
}

module pow2.editor {
   declare var joint:any;
   pow2.editor.app.directive('entityEditorView', ['$platform', ($platform:IAppPlatform) => {
      return {
         restrict: "E",
         replace: true,
         templateUrl: 'source/shell/directives/editors/entityEditorView.html',
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
                  var graph = new joint.dia.Graph;
                  var paper = new joint.dia.Paper({
                     el: $(element),
                     width: element.width(),
                     height: element.height(),
                     gridSize: 1,
                     model: graph,
                     snapLinks: true,
                     defaultLink: new joint.shapes.devs.Link
                  });

                  var connect = function(source, sourcePort, target, targetPort) {
                     var link = new joint.shapes.devs.Link({
                        source: { id: source.id, selector: source.getPortSelector(sourcePort) },
                        target: { id: target.id, selector: target.getPortSelector(targetPort) }
                     });
                     graph.addCell(link);
                  };

                  var compCount:number = _.keys(d.components).length;
                  var entityCoupling = new joint.shapes.devs.Coupled({
                     size: { width: 300, height: compCount * 50 },
                     inPorts: _.keys(d.inputs),
                     outPorts: _.keys(d.outputs),
                     attrs: { text : { text: d.name + ":" + d.type }}
                  });
                  graph.addCell(entityCoupling);

                  var at:number = 0;
                  angular.forEach(d.components,(comp:IEntityComponentData,name:string)=>{
                     var compAtomic = new joint.shapes.devs.Atomic({
                        size: { width: 350, height: 30 },
                        inPorts: ['host'],
                        outPorts: [],
                        attrs: { text : { text: name + ":" + comp.type }}
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
