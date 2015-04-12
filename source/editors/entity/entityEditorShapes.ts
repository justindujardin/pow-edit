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
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../../types/jointjs/jointjs.d.ts"/>
///<reference path="../../app.ts"/>


interface IEntityComponentData {
   type:string;
   name:string;
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

   export class BaseModel extends joint.shapes.basic.Generic {
      markup:string = [
         '<g class="rotatable">',
            '<g class="scalable">',
               '<rect class="body"/>',
            '</g>',
            '<g class="inPorts"/><g class="outPorts"/>',
         '</g>'
      ].join('');
      portMarkup:string = '<g class="port port<%= id %>"><rect class="port-body"/><text class="port-label"/></g>';
      private _portSelectors:string[] = [];

      initialize() {
         super.initialize();
         this.on('change:inPorts change:outPorts', this.updatePortsAttrs, this);
         this.updatePortsAttrs();
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

            if (index < 0) throw new Error("getPortSelector(): Port '" + name + "' doesn't exist.");
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
         attrs[portSelector] = { ref: this.getPortAttachElement(), 'ref-y': (index + 0.5) * (1 / total) };

         if (selector === '.outPorts') {
            attrs[portSelector]['ref-dx'] = 0;
         }

         return attrs;
      }

      getPortAttachElement():string {
         return '.body';
      }

   }

   export class Model extends BaseModel {
      defaults():any {
         return joint.util.deepSupplement({
            type: 'pow2.Model',
            size: { width: 1, height: 1 },
            inPorts: [],
            outPorts: [],

            attrs: {
               rect: { 'width': 200 },
               '.': { magnet: false },
               '.port-body': {
                  width:10,height:10,
                  'r-x':5,'r-y':5,
                  magnet: true,
                  stroke: 'black'
               },
               '.inPorts .port-label': { x:-15, dy: 4, 'text-anchor': 'end' },
               '.outPorts .port-label':{ x: 15, dy: 4 }
            }
         }, joint.shapes.basic.Generic.prototype.defaults);
      }
   }


   export class ComponentModel extends Model {
      markup:string = [
         '<g class="rotatable">',
         '<g class="scalable">',
         '<rect class="body"/>',
         '</g>',
         '<text class="entity-component-text"/>',
         '<g class="inPorts"/><g class="outPorts"/>',
         '</g>'
      ].join('');

      defaults():any {
         return joint.util.deepSupplement({
            type: 'pow2.ComponentModel',
            size:{width:1,height:1},
            attrs: {
               rect: { 'width': 2, height:1 },
               '.entity-component-text': {
                  'ref': '.body', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle'
               }
            }
         }, super.defaults());
      }
      initialize() {
         super.initialize();
         var attrs = this.get('attrs');
         attrs['.entity-component-text'].text = this.get('name');
      }
   }

   export class EntityModel extends Model {
      markup:string = [
         '<g class="rotatable">',
         '<g class="scalable">',
         '<rect class="entity-heading-rect"/><rect class="entity-body-rect"/>',
         '</g>',
         '<text class="entity-heading-text"/><text class="entity-body-text"/>',
         '<g class="inPorts"/><g class="outPorts"/>',
         '</g>'
      ].join('');
      getPortAttachElement():string {
         return '.entity-body-rect';
      }
      defaults():any {
         return joint.util.deepSupplement({
            type: 'pow2.EntityModel',
            size: { width: 200 },
            attrs: {
               '.inPorts .port-body': { fill: 'PaleGreen' },
               '.outPorts .port-body': { fill: 'Tomato' },

               '.entity-heading-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#3498db' },
               '.entity-body-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#2980b9' },

               '.entity-heading-text': {
                  'ref': '.entity-heading-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle'
               },
               '.entity-body-text': {
                  'ref': '.entity-body-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle'
               }

            }
         }, super.defaults());
      }
      initialize() {
         super.initialize();
         this.on('change:component', this.updateLayout, this);
         this.updateLayout();
      }
      updateLayout() {
         var headerHeight = 15;
         var attrs = this.get('attrs');
         attrs['.entity-heading-text'].text = this.get('name');
         attrs['.entity-heading-rect'].height = headerHeight;
         attrs['.entity-heading-rect'].transform = 'translate(0,0)';

         var text = this.get('objectType');
         var lines = _.isArray(text) ? text : [text];
         var rectHeight = lines.length * 20 + 50;
         attrs['.entity-body-text'].text = '';//lines.join('\n');
         attrs['.entity-body-rect'].height = rectHeight;
         attrs['.entity-body-rect'].transform = 'translate(0,'+ headerHeight + ')';
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
   export class ComponentModelView extends ModelView {}
   export class EntityModelView extends ModelView {}
}
