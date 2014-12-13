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
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive('accordion', [() => {
      return {
         restrict: 'E',
         replace: true,
         transclude:true,
         controller: AccordianController,
         controllerAs:'accordionCtrl',
         templateUrl: 'source/shell/directives/accordion.html'
      };
   }]);

   export class AccordianController {
      public items:AccordianItemController[] = [];
      static $inject:string[] = ['$element'];
      constructor(public $element:any){
         console.log('accordion: ' + $element);
      }
   }

   pow2.editor.app.directive('accordionItem', ['$parse',($parse) => {
      return {
         restrict: 'E',
         replace: true,
         require: ['^accordion','accordionItem'],
         transclude:true,
         controller: AccordianItemController,
         controllerAs:'itemCtrl',
         templateUrl: 'source/shell/directives/accordionItem.html',
         compile:(element,attributes) => {
            var stamp = $parse(attributes.title);
            return (scope,elements,attribute,controllers:any[]) => {
               var parent:AccordianController = controllers[0];
               var ctrl:AccordianItemController = controllers[1];
               ctrl.title = stamp(scope);
               parent.items.push(ctrl);
            }
         }
      };
   }]);

   export class AccordianItemController {
      public active:boolean = true;
      public title:string = '';
      static $inject:string[] = ['$element'];
      constructor(public $element:any){
         console.log('accordion-item: ' + $element);
      }
      toggle(){
         this.active=!this.active;
         this.$element.toggleClass('collapsed',!this.active);
      }
   }

}
