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

            $scope.headClass = function(node) {
               if (!node || typeof node[$scope.nodeChildren] === 'undefined'){
                  return "tree-normal"
               }
               if (node[$scope.nodeChildren].length && !$scope.expandedNodes[this.$id]) {
                  return "tree-collapsed";
               }
               if (node[$scope.nodeChildren].length && $scope.expandedNodes[this.$id]) {
                  return "tree-expanded";
               }
               return "tree-normal"

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
               '<ul>' +
                  '<li ng-repeat="node in node.' + $scope.nodeChildren+'" ng-class="headClass(node)">' +
                  '<a class="item" ng-click="selectNode(node)">{{node.label}}</a>' +
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
