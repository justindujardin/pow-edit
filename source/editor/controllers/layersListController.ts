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
///<reference path="../../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/actions.ts"/>

module pow2.editor {

   pow2.editor.app.controller('LayersListController', [
      '$scope', '$actions',
      ($scope:any,$actions:ActionManager)=> {
         $scope.renameLayer = (layer:PowTileLayer,oldName:string,newName:string)=>{
            if(oldName === newName){
               return;
            }
            // NOTE: this is a bit of a hack.  The action is being executed after
            // the layer has changed, so we change it back so that the action
            // can properly record the oldName for undo.   The oldName argument
            // is supplied by the inline-edit callback.
            // The reason it's already changed is because the inline-edit does a 2way
            // binding to the `layer.name` value.
            // TODO: Perhaps remove the ng-model binding on inline-edit and go with
            //       a callback approach that doesn't immediately update the model as a
            //       user types.
            layer.name = oldName;
            $actions.executeAction(new LayerRenameAction(layer,newName));
         };
      }
   ]);
}