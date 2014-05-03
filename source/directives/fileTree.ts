///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>

/**
 * File System Tree directive
 *
 * Based on angular-tree-control : https://github.com/wix/angular-tree-control
 */
module pow2.editor {


   export var fileTree:ng.IModule = angular.module( 'uiTree', [] );
   fileTree.directive( 'treecontrol', ['$compile', function( $compile ) {
      return {
         restrict: 'E',
         require: "treecontrol",
         transclude: true,
         scope: {
            treeModel: "=",
            //selectedNode: "=",
            onSelection: "&",
            nodeChildren: "@"
         },
         controller: function( $scope ) {

            $scope.nodeChildren = $scope.nodeChildren || 'children';
            $scope.expandedNodes = {};
            $scope.level = 0;

            $scope.iconClass = function(node){
               var results = ['fa'];
               if (!node || typeof node[$scope.nodeChildren] === 'undefined'){
                  if(node.label.indexOf('.tmx') !== -1){
                     results.push('fa-file-text-o');
                  }
                  else {
                     results.push('fa-file-o');
                  }
               }
               else {
                  var hasChildren:boolean = node && node[$scope.nodeChildren] && node[$scope.nodeChildren].length;
                  if (hasChildren && !$scope.expandedNodes[this.$id]) {
                     results.push('fa-chevron-right');
                  }
                  if (hasChildren && $scope.expandedNodes[this.$id]) {
                     results.push('fa-chevron-down');
                  }
               }
               return results;
            };

            $scope.headClass = function(node) {
               var results = ['depth-' + node.depth];
               if (!node || typeof node[$scope.nodeChildren] === 'undefined'){
                  results.push('leaf');
                  if(node.label.indexOf('.tmx') !== -1){
                     results.push('tmx');
                  }
               }
               else {
                  results.push('branch');
               }
               var hasChildren:boolean = node && node[$scope.nodeChildren] && node[$scope.nodeChildren].length;
               if (hasChildren && !$scope.expandedNodes[this.$id]) {
                  results.push('collapsed');
               }
               if (hasChildren && $scope.expandedNodes[this.$id]) {
                  results.push('expanded');
               }
               if($scope.selectedNode === node){
                  results.push('selected');
               }
               return results;

            };

            $scope.selectNode = function(node) {
               if (node.children && node.children.length > 0) {
                  $scope.expandedNodes[this.$id] = !$scope.expandedNodes[this.$id];
               }
               else {
                  $scope.selectedScope = this.$id;
                  $scope.selectedNode = node;
                  if (typeof $scope.onSelection === 'function') {
                     $scope.onSelection({node: node});
                  }
               }
            };

            $scope.nodeExpanded = function() {
               return $scope.expandedNodes[this.$id];
            };

            //tree template
            var template =
                   '<ul class="">' +
                   '<li class="list-node" ng-repeat="node in node.' + $scope.nodeChildren+'" ng-class="headClass(node)">' +
                   '<a class="item" ng-click="selectNode(node)"><i ng-class="iconClass(node)"></i>{{node.label}}</a>' +
                   '<treeitem ng-if="nodeExpanded()"></treeitem>' +
                   '</li>' +
                   '</ul>';

            return {
               templateRoot: $compile(template),
               templateChild: $compile(template)
            }
         },
         compile: function(element, attrs, childTranscludeFn) {
            return function ( scope, element, attrs, treemodelCntr ) {

               function updateNodeOnRootScope(newValue) {
                  if (angular.isArray(newValue)) {
                     scope.node = {};
                     scope.node[scope.nodeChildren] = newValue;
                  }
                  else {
                     scope.node = newValue;
                  }
               }
               scope.$watch("treeModel", updateNodeOnRootScope);
               updateNodeOnRootScope(scope.treeModel);

               //Rendering template for a root node
               treemodelCntr.templateRoot( scope, function(clone) {
                  element.html('').append( clone );
               });
               // save the transclude function from compile (which is not bound to a scope as apposed to the one from link)
               // we can fix this to work with the link transclude function with angular 1.2.6. as for angular 1.2.0 we need
               // to keep using the compile function
               scope.$treeTransclude = childTranscludeFn;
            }
         }
      };
   }]);


   fileTree.directive("treeitem", function() {
      return {
         restrict: 'E',
         require: "^treecontrol",
         link: function( scope, element, attrs, treemodelCntr) {

            scope.level = scope.$parent.level + 1;

            // Rendering template for the current node
            treemodelCntr.templateChild(scope, function(clone) {
               element.html('').append(clone);
            });
         }
      }
   });
   fileTree.directive("treeTransclude", function() {
      return {
         link: function(scope, element, attrs, controller) {
            scope.$treeTransclude(scope, function(clone) {
               element.empty();
               element.append(clone);
            });
         }
      }
   });
}
