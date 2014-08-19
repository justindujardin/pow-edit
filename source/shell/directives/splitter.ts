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
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>

/**
 * Pane splitter directive, for resizing container views within a box.
 *
 * Based on: https://github.com/blackgate/bg-splitter
 * Copyright (c) 2013 blackgate, https://github.com/blackgate
 */
module pow2.editor {

   var splitter:ng.IModule = angular.module( 'uiSplitter', [] );

   export interface ILayoutStyles {
      handle:{ [style:string]:any };
      first:{ [style:string]:any };
      second:{ [style:string]:any };
   }

   export class UISplitController extends pow2.Events implements IProcessObject {

      static LAYOUT:string = 'layout';

      _uid:string;
      static $inject:string[] = ['$scope','$time'];
      constructor(
         public $scope:any,
         public $time:pow2.Time){
         super();

         // Tie to time updates for great layout justice.
         this._uid = _.uniqueId('ui-split');
         $time.addObject(this);
         $time.start();
         $scope.$on('destroy',()=>{
            this.destroy();
         });
      }
      destroy(){
         this.$time.removeObject(this);
      }

      processFrame(elapsed:number) {
         if(this._dirty){
            this._dirty = false;
            this.sizeChildren();
         }
      }

      public element:ng.IAugmentedJQuery = null;

      private _orientation:string = 'horizontal';

      /**
       * The first item to be split.  This is either the left or top item
       * visually, depending on the orientation of the split.
       */
      private _first:UISplitPanelController = null;
      /**
       * The second item to be split.  This is either the right or bottom item
       * visually, depending on the orientation of the split.
       */
      private _second:UISplitPanelController = null;

      private _dirty:boolean = false;
      private _targetX:number = -1;
      private _targetY:number = -1;

      private _checkReady() {
         if(this._second && this._first){
            this._dirty = true;
         }
      }

      /**
       * Set the orientation of the split
       */
      setOrientation(orientation:string){
         if(orientation === 'horizontal' || orientation === 'vertical'){
            this._orientation = orientation;
         }
         else {
            throw new Error("Invalid orientation");
         }
         this._checkReady();
      }
      getOrientation():string {
         return this._orientation;
      }

      /**
       * Set the first item to be split.
       *
       * @param controller the split panel controller
       */
      setFirst(controller:UISplitPanelController){
         if(this._first !== null){
            console.log("overwriting left panel with another")
         }
         this._first = controller;
         this._checkReady();
      }
      getFirst():UISplitPanelController { return this._first; }
      /**
       * Set the second item to be split.
       *
       * @param controller the split panel controller
       */
      setSecond(controller:UISplitPanelController){
         if(this._second !== null){
            console.log("overwriting second panel with another")
         }
         this._second = controller;
         this._checkReady();
      }
      getSecond():UISplitPanelController { return this._second; }

      /**
       * Flag the layout as dirty
       */
      setDirty(clientX:number=-1,clientY:number=-1){
         this._dirty = true;
         this._targetX = clientX;
         this._targetY = clientY;
      }

      sizeChildren(){
         if(!this._first || !this._second){
            throw new Error("Cannot split without two assigned children");
         }
         // TODO: cache this and invalidate from split directive on resize events.
         var bounds = this.element[0].getBoundingClientRect();

         var pos = 0;
         if (this._orientation === 'vertical' && this._targetY !== -1) {
            var height = bounds.bottom - bounds.top;
            pos = this._targetY - bounds.top;
            if (pos < this._first.minSize) return;
            if (height - pos < this._second.minSize) return;
            this.trigger(UISplitController.LAYOUT,<ILayoutStyles>{
               handle: { top: pos + 'px' },
               first: { height: pos + 'px' },
               second: { top: pos + 'px' }
            });
         } else if(this._targetX !== -1) {
            var width = bounds.right - bounds.left;
            pos = this._targetX - bounds.left;
            if (pos < this._first.minSize) return;
            if (width - pos < this._second.minSize) return;
            this.trigger(UISplitController.LAYOUT,<ILayoutStyles>{
               handle: { left: pos + 'px' },
               first: { width: pos + 'px' },
               second: { left: pos + 'px' }
            });
         }

      }
   }
   export class UISplitPanelController extends pow2.Events {
      static $inject:string[] = ['$scope'];
      constructor(public $scope:any){
         super();
      }
      public small:boolean = false;
      public large:boolean = false;
      public minSize:number = -1;
      public maxSize:number = -1;
      public element:ng.IAugmentedJQuery = null;
      public parent:UISplitController = null;
   }

   splitter.directive('uiSplit', function() {
      return {
         restrict: 'A',
         scope: {
            orientation: '@'
         },
         require: 'uiSplit',
         controller: UISplitController,
         link: function(scope, element, attrs, controller:UISplitController) {
            var handler = angular.element('<div class="ui-split-handle"></div>');
            var drag = false;
            var doc = angular.element(document);
            var win = angular.element(window);
            controller.element = element;
            element.addClass('ui-split');
            controller.setOrientation(typeof attrs.orientation !== 'undefined' ? attrs.orientation : 'horizontal');
            element.addClass(controller.getOrientation());

            controller.on(UISplitController.LAYOUT,(styles:ILayoutStyles)=>{
               var first = controller.getFirst().element;
               var second = controller.getSecond().element;
               handler.css(styles.handle);
               first.css(styles.first);
               second.css(styles.second);
            });
            win.on('resize',()=>{
               controller.setDirty();
            });
            element.on('resize',()=>{
               controller.setDirty();
            });
            element.append(handler);
            element.bind('mousemove', function (ev) {
               if (!drag) return;
               controller.setDirty(ev.clientX,ev.clientY);
            });
            handler.bind('mousedown', function (ev) {
               ev.preventDefault();
               drag = true;
               return false;
            });
            doc.bind('mouseup', function (ev) {
               drag = false;
            });
         }
      };
   });
   splitter.directive('uiSplitPanel', function () {
      return {
         restrict: 'A',
         require: ['^uiSplit','uiSplitPanel'],
         scope: {
            minSize: '@'
         },
         controller:UISplitPanelController,
         link: function(scope, element, attributes, controllers:any[]) {
            var parent:UISplitController = controllers[0];
            var self:UISplitPanelController = controllers[1];
            self.parent = parent;
            self.element = element;

            self.minSize = typeof attributes.minSize !== 'undefined' ? attributes.minSize : 0;
            self.maxSize = typeof attributes.maxSize !== 'undefined' ? attributes.maxSize : 0;
            if(typeof attributes.small !== 'undefined'){
               scope.small = true;
            }
            else if(typeof attributes.large !== 'undefined'){
               scope.large = true;
            }
            if(typeof attributes.first !== 'undefined'){
               element.addClass('ui-split-first');
               parent.setFirst(self);
            }
            else if(typeof attributes.second !== 'undefined'){
               element.addClass('ui-split-second');
               parent.setSecond(self);
            }
         }
      };
   });

}