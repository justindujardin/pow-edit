///<reference path="../../../../types/angular/angular.d.ts"/>
///<reference path="../../../../types/jointjs/jointjs.d.ts"/>
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

///////////////////////////////////////////////////////////////////
/*!
 Based on DEVS jointjs template classes.

 JointJS v0.9.2 - JavaScript diagramming library  2014-09-16
 */

module joint.shapes.pow2 {
   export class Model extends joint.shapes.basic.Generic {
      markup:string = [
         '<g class="rotatable">',
         '<g class="scalable">',
         '<rect class="entity-heading-rect"/><rect class="entity-body-rect"/>',
         '</g>',
         '<text class="entity-heading-text"/><text class="entity-body-text"/>',
         '<g class="inPorts"/><g class="outPorts"/>',
         '</g>'
      ].join('');
      portMarkup:string = '<g class="port port<%= id %>"><rect class="port-body"/><text class="port-label"/></g>';

      defaults():any {
         return joint.util.deepSupplement({
            type: 'pow2.Model',
            size: { width: 64, height: 32 },
            inPorts: [],
            outPorts: [],


            attrs: {
               rect: { 'width': 200 },

               '.entity-heading-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#3498db' },
               '.entity-body-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#2980b9' },

               '.entity-heading-text': {
                  'ref': '.entity-heading-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle'
               },
               '.entity-body-text': {
                  'ref': '.entity-body-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle'
               },
               '.': { magnet: false },
               '.port-body': {
                  width:10,height:10,
                  'r-x':5,'r-y':5,
                  magnet: true,
                  stroke: 'black'
               },
               text: {
                  fill: 'black',
                  'pointer-events': 'none'
               },
               '.inPorts .port-label': { x:-15, dy: 4, 'text-anchor': 'end' },
               '.outPorts .port-label':{ x: 15, dy: 4 }
            }
         }, joint.shapes.basic.Generic.prototype.defaults);
      }

      private _portSelectors:string[] = [];

      initialize() {
         super.initialize();
         this.on('change:component', this.updateLayout, this);
         this.on('change:inPorts change:outPorts', this.updatePortsAttrs, this);
         this.updatePortsAttrs();
         this.updateLayout();
      }

      updateLayout() {
         var headerHeight:number = 15;
         var attrs = this.get('attrs');
         attrs['.entity-heading-text'].text = this.get('name');
         attrs['.entity-heading-rect'].height = headerHeight;
         attrs['.entity-heading-rect'].transform = 'translate(0,0)';

         var text = this.get('objectType');
         var lines = _.isArray(text) ? text : [text];
         var rectHeight = lines.length * 20 + 30;
         attrs['.entity-body-text'].text = lines.join('\n');
         attrs['.entity-body-rect'].height = rectHeight;
         attrs['.entity-body-rect'].transform = 'translate(0,'+ headerHeight + ')';
      }

      updatePortsAttrs(eventName?:string) {

         // Delete previously set attributes for ports.
         var currAttrs = this.get('attrs');
         _.each(this._portSelectors, function(selector) {
            if (currAttrs[selector]) delete currAttrs[selector];
         });

         // This holds keys to the `attrs` object for all the port specific attribute that
         // we set in this method. This is necessary in order to remove previously set
         // attributes for previous ports.
         this._portSelectors = [];

         var attrs = {};

         _.each(this.get('inPorts'), (portName, index, ports) => {
            var portAttributes = this.getPortAttrs(portName, index, ports.length, '.inPorts', 'in');
            this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
            _.extend(attrs, portAttributes);
         });

         _.each(this.get('outPorts'), (portName, index, ports) => {
            var portAttributes = this.getPortAttrs(portName, index, ports.length, '.outPorts', 'out');
            this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
            _.extend(attrs, portAttributes);
         });

         // Silently set `attrs` on the cell so that noone knows the attrs have changed. This makes sure
         // that, for example, command manager does not register `change:attrs` command but only
         // the important `change:inPorts`/`change:outPorts` command.
         this.attr(attrs, { silent: true });
         // Manually call the `processPorts()` method that is normally called on `change:attrs` (that we just made silent).
         this.processPorts();
         // Let the outside world (mainly the `ModelView`) know that we're done configuring the `attrs` object.
         this.trigger('process:ports');

      }

      getPortSelector(name) {
         var selector = '.inPorts';
         var index = this.get('inPorts').indexOf(name);

         if (index < 0) {
            selector = '.outPorts';
            index = this.get('outPorts').indexOf(name);

            if (index < 0) throw new Error("getPortSelector(): Port doesn't exist.");
         }

         return selector + '>g:nth-child(' + (index + 1) + ')>rect';
      }

      getPortAttrs(portName, index, total, selector, type) {

         var attrs = {};

         var portClass = 'port' + index;
         var portSelector = selector + '>.' + portClass;
         var portLabelSelector = portSelector + '>.port-label';
         var portBodySelector = portSelector + '>.port-body';

         attrs[portLabelSelector] = { text: portName };
         attrs[portBodySelector] = { port: { id: portName || _.uniqueId(type) , type: type } };
         attrs[portSelector] = { ref: '.entity-body-rect', 'ref-y': (index + 0.5) * (1 / total) };

         if (selector === '.outPorts') {
            attrs[portSelector]['ref-dx'] = 0;
         }

         return attrs;
      }
   }


   export class Atomic extends Model {
      defaults():any {
         return joint.util.deepSupplement({
            type: 'pow2.Atomic',
            size: { width: 80, height: 80 },
            attrs: {
               //'.body': { fill: 'aliceblue' },
               '.entity-heading-text': { text: 'Atomic' },
               '.inPorts .port-body': { fill: 'PaleGreen' },
               '.outPorts .port-body': { fill: 'Tomato' }
            }
         }, super.defaults());
      }
   }

   export class Coupled extends Model {
      defaults():any {
         return joint.util.deepSupplement({
            type: 'pow2.Coupled',
            size: { width: 200 },
            attrs: {
               '.entity-heading-text': { text: 'Coupled' },
               '.inPorts .port-body': { fill: 'PaleGreen' },
               '.outPorts .port-body': { fill: 'Tomato' }
            }
         }, super.defaults());
      }
   }

   export class Link extends joint.dia.Link {
      defaults():any {
         return {
            type: 'pow2.Link',
            attrs: { '.connection' : { 'stroke-width' :  2 }}
         };
      }
   }
   export class ModelView extends joint.dia.ElementView {}
   _.extend(ModelView.prototype,joint.shapes.basic.PortsViewInterface);
   export class AtomicView extends ModelView {}
   export class CoupledView extends ModelView {}
}

module pow2.editor {
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