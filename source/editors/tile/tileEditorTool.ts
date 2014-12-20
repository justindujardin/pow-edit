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
///<reference path="./tileEditor.ts"/>
module pow2.editor {
   export class TileEditorTool implements IEditorTool {
      name:string = "TileEditorTool";
      editor:TileEditor = null;
      context:IEditorContext = null;
      ctrl:TileEditorController = null;
      iconClass:string = 'fa-question';
      public drag:IDragEvent = {
         active:false,
         start:null,
         current:null,
         cameraStart:null,
         delta:null
      };
      escapeTool(canCancel:boolean):boolean {
         // Clear any custom cursor the tool has set
         this.setCursorClass(null);
         return true;
      }
      activateTool(context:pow2.editor.IEditorContext):boolean {
         this.editor = <TileEditor>context.getEditor();
         this.context = context;
         this.ctrl = this.editor.ctrl;
         return !!this.editor && !!this.context && !!this.ctrl;
      }

      private _cursorSet:string = null;
      setCursorClass(cursorClass:string):boolean{
         var el:any = angular.element(this.ctrl.container);
         if(this._cursorSet !== null){
            el.removeClass(this._cursorSet);
         }
         if(cursorClass !== null){
            el.addClass(cursorClass);
         }
         this._cursorSet = cursorClass;
         return true;
      }
      onPan(ev:any){}
      onPanstart(ev:any){}
      onPanend(ev:any){}
      onTap(ev:any){}

      handleMouseWheel(ev:any) {
         if(!this.ctrl.sceneContainer) {
            return;
         }
         var delta:number = (ev.originalEvent.detail ? ev.originalEvent.detail * -1 : ev.originalEvent.wheelDelta);
         var move:number = this.ctrl.cameraZoom / 10;
         this.ctrl.cameraZoom += (delta > 0 ? move : -move);
         this.ctrl.updateCamera();
         ev.stopImmediatePropagation();
         ev.preventDefault();
         return false;
      }
   }
}