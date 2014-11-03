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
///<reference path="../paintTool.ts"/>
module pow2.editor {

   export class LayerEraseTool extends PaintTool {
      name:string = 'Erase';
      iconClass:string = 'fa-eraser';
      private _doPaint(ev:any){
         var mousePoint:pow2.Point = this.ctrl.mouseEventToWorld(ev);
         var mouseAtIndex:number = this.ctrl.picker.indexFromPoint(mousePoint);
         this.paintAt(mouseAtIndex,0);
      }
      onPanstart(ev:any):any{
         this._doPaint(ev);
      }
      onPan(ev:any):any{
         this._doPaint(ev);
      }
   }
}