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
///<reference path="../tileEditorContext.ts"/>
///<reference path="../tools/layer/layerEraseTool.ts"/>
///<reference path="../tools/layer/layerFloodPaintTool.ts"/>
///<reference path="../tools/layer/layerPencilPaintTool.ts"/>
module pow2.editor {

   export class LayerEditContext extends TileEditorContext {
      constructor() {
         super();
      }
      getTools():TileEditorTool[] {
         return [
            new pow2.editor.HandTool(),
            new pow2.editor.LayerPencilPaintTool(),
            new pow2.editor.LayerFloodPaintTool(),
            new pow2.editor.LayerEraseTool(),
            new pow2.editor.ZoomTool(),
         ];
      }
   }
}