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

   export class ZoomTool extends TileEditorTool {
      static NAME:string = 'Zoom';
      name:string = ZoomTool.NAME;
      iconClass:string = 'fa-search';
      public activateTool(context: IEditorContext): boolean {
         return super.activateTool(context) && this.setCursorClass('cursor-zoom-in');
      }
      onTap(ev:MouseEvent):any{
         var move:number = this.ctrl.cameraZoom / 2;
         this.ctrl.cameraZoom += move;
         this.ctrl.updateCamera();
         return false;
      }
   }
}