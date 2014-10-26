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
/// <reference path="./IEditorContext.ts"/>
/// <reference path="./IEditorTool.ts"/>

module pow2.editor {

   export interface IEditor {
      // lifetime
      initEditor(object:any):boolean;
      destroyEditor():boolean;

      // tools
      toolbox:IEditorToolbox;
      defaultTools:IEditorTool[];
      setActiveTool(name:string):boolean;
      getActiveTool():IEditorTool;

      getActiveContext():IEditorContext;
      pushContext(object:any):boolean;
      popContext():boolean;
   }
}