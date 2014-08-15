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

module pow2.editor {

   pow2.editor.app.directive("paneItem", [() => {
      return {
         restrict: "E",
         replace: true,
         transclude:true,
         template: '<div class="pane-item"><a><i></i><span></span></a><div ng-transclude></div></div>',
         link: (scope, element, attributes) => {
            var link = element.find('a > span');
            link.text(attributes.name);
         }
      };
   }]);
}