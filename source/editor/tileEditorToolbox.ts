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
module pow2.editor {

   export class TileEditorToolbox {
      private _context:IEditorContext = null;
      private _tools:IEditorTool[] = [];
      fillToolbox(context:IEditorContext) {
         this._tools = context.getTools();
      }
      getToolCount():number {
         return this._tools.length;
      }
      getTools():IEditorTool[] {
         return this._tools;
      }
      clearTools() {
         this._tools.length = 0;
      }
   }
}