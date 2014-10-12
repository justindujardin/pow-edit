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
///<reference path="../../app.ts"/>

module pow2.editor {
   // Inline edit very slightly modified version of: http://jsfiddle.net/NDFHg/427/
   pow2.editor.app.directive('inlineEdit', () => {
      return {
         restrict: 'E',
         scope: {
            value: '='
         },
         template: '<span ng-dblclick="edit()" ng-bind="value"></span><i ng-click="edit()"></i><input ng-model="value">',
         link: (scope, element, attributes) => {
            var input = angular.element(element.children('input'));
            element.addClass('inline-edit');
            scope.editing = false;
            var editValue:string = null;
            scope.edit = () => {
               scope.editing = true;
               editValue = (<any>input[0]).value;
               element.addClass('active');
               input[0].focus();
               (<any>input[0]).setSelectionRange(0, editValue.length);
            };
            input.on('blur', () => {
               scope.editing = false;
               element.removeClass('active');
            });
            input.on('keydown', (event) => {
               var esc:boolean = event.which == 27;
               var enter:boolean = event.which == 13;
               if (esc || enter) {
                  if (esc) {
                     scope.$apply(()=>{
                        scope.value = editValue;
                     });
                  }
                  input.blur();
                  event.preventDefault();
                  return false;
               }
            });

         }
      };
   });
}
