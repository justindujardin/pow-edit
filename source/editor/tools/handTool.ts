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
///<reference path="../tileEditorTool.ts"/>
module pow2.editor {

   export class HandTool extends TileEditorTool {
      static NAME:string = 'Hand';
      name:string = HandTool.NAME;
      iconClass:string = 'fa-arrows';
      private _cameraStart:pow2.Point = new pow2.Point();
      public activateTool(context: IEditorContext): boolean {
         return super.activateTool(context) && this.setCursorClass('cursor-hand');
      }
      onPan(ev:any){
         this.ctrl.cameraCenter.x = this._cameraStart.x + -ev.deltaX * (1 / this.ctrl.cameraZoom);
         this.ctrl.cameraCenter.y = this._cameraStart.y + -ev.deltaY * (1 / this.ctrl.cameraZoom);
         this.ctrl.updateCamera();
      }
      onPanstart(ev:any){
         this._cameraStart.set(this.editor.ctrl.cameraCenter);
         this.setCursorClass('cursor-hand-active');
      }
      onPanend(ev:any):any{
         this._cameraStart.zero();
         this.setCursorClass('cursor-hand');
      }
   }
}