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
///<reference path="./tileEditorTool.ts"/>
module pow2.editor {

   export class TileEditorContext implements IEditorContext {
      private _activeTool:TileEditorTool = null;
      private _defaultTool:TileEditorTool = null;
      private _source:any = null;
      private _editor:IEditor = null;

      getEditor():IEditor {
         return this._editor;
      }
      setEditor(ed:IEditor):boolean {
         this._editor = ed;
         return !!this._editor;
      }


      enterContext(source:any):boolean {
         this.setContextSource(source);
         this._tools = this.getTools();
         return true;
      }
      exitContext():boolean {
         return true;
      }
      getContextSource():any {
         return this._source;
      }
      setContextSource(object:any):boolean{
         this._source = object;
         return true;
      }

      getTools():TileEditorTool[] { return []; }
      private _tools:TileEditorTool[] = [];
      private _getTool(name:string):TileEditorTool {
         for (var i = this._tools.length - 1; i >= 0; i--) {
            var t:TileEditorTool = this._tools[i];
            if(t.name === name){
               return t;
            }
         }
         return null;
      }

      setActiveTool(name:string):boolean{
         if(this._activeTool && !this._activeTool.escapeTool(true)){
            return false;
         }
         var tool:TileEditorTool = this._getTool(name);
         if(tool && tool.activateTool(this)){
            this._activeTool = tool;
            return true;
         }
         return false;
      }
      getActiveTool():IEditorTool{
         return this._activeTool;
      }

      setDefaultTool(name:string):boolean{
         var tool:TileEditorTool = this._getTool(name);
         if(tool){
            this._defaultTool = tool;
            return true;
         }
         return false;
      }
      getDefaultTool():IEditorTool{
         return this._defaultTool;
      }

   }
}