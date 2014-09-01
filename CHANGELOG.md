<a name="0.0.4"></a>
### 0.0.4 (2014-09-01)


#### Bug Fixes

* **Coverage:** issue where report showed up containing no files ([319195a7](http://github.com/justindujardin/pow-edit/commit/319195a726dbd139980c544524faeaad6a3f8dfa))
* **Heroku:** add grunt-cli as dependency ([112d3d45](http://github.com/justindujardin/pow-edit/commit/112d3d45d7eace08437603b3ae870cf6d3dddb9a))
* **MarkdownEditorView:** render error rather than crash in showdown if read fails ([72a2ef9d](http://github.com/justindujardin/pow-edit/commit/72a2ef9d3b12dc4fd43eac89690682cb6efa9827))
* **tileEditorView:** issue where loading would not hide on destroy ([da1ea450](http://github.com/justindujardin/pow-edit/commit/da1ea4503263c313c1cef32368d7ef098f66f485))


#### Features

* **$actions:** implement actions manager for great undo justice ([0cc948fa](http://github.com/justindujardin/pow-edit/commit/0cc948fac50fcf18d40eac605261b5362d18df9d))
* **$keys:** add keybinding service for editor shortcuts ([7d9502e3](http://github.com/justindujardin/pow-edit/commit/7d9502e36a6582dafe1b203deb5ba31b6d664c04))
* **Platform:** add normalizePath for cleaning up relative path strings ([56d31205](http://github.com/justindujardin/pow-edit/commit/56d3120562c5f566efc2f44cabe9495feef509cb))
* **TileEditorView:**
  * add layer select and visibilty toggle actions ([f29ef2dd](http://github.com/justindujardin/pow-edit/commit/f29ef2dd96f4489747fe773f468c84684ca52cfe))
  * add tile picker for paint tool ([e67ae886](http://github.com/justindujardin/pow-edit/commit/e67ae886cb3d6f278d9a98c2045dcc1695587d6c))
  * add active state to toolbox tools ([b398a369](http://github.com/justindujardin/pow-edit/commit/b398a369ce3ce4dcebdebc524af7852b1f8b2530))
  * support toolbox with move paint and erase tools ([6347adc7](http://github.com/justindujardin/pow-edit/commit/6347adc7e5c423fa0e85e8fdb806f0c89dec8084))
  * support undo/redo of paint and erase actions ([626875f3](http://github.com/justindujardin/pow-edit/commit/626875f3bc74c679d42eba6e2412b8d678568bea))
* **splitter:** update splitter to support notifying parent and children of resize ([e3109099](http://github.com/justindujardin/pow-edit/commit/e310909914e96668d93479a42a33060faef279d0))
* **test:** add karma testing and coveralls reporting ([15eafca4](http://github.com/justindujardin/pow-edit/commit/15eafca471fc1965724aefc569383d060100b2cb))
* **tileEditorView:**
  * support cmd-z and cmd-shift-z as well as ctrl for undo and redo ([4c11b5eb](http://github.com/justindujardin/pow-edit/commit/4c11b5ebd81ea8dd5f81911ab6cb773a6393c3ee))
  * support touch pan ([f326f00e](http://github.com/justindujardin/pow-edit/commit/f326f00e4fc93a05bc02f15777f82475147f4f27))


<a name="0.0.3"></a>
### 0.0.3 (2014-05-17)


#### Features

* **documentView:** directive for viewing documents of any type ([4ce3b91a](http://github.com/justindujardin/pow-edit/commit/4ce3b91aa5b82f6a6c653b156027ff85cbdc1bba))
* **editorView:** zoom camera on screen center ([67e13e46](http://github.com/justindujardin/pow-edit/commit/67e13e46d875efae96b86026e50453978c1a622f))
* **fileTree:** add file tree icons based on extension ([9a6a7caa](http://github.com/justindujardin/pow-edit/commit/9a6a7caae647d9e27920c0fb710bd53e2eda8950))
* **markdownEditorView:** add basic editor for markdown files ([cd14ae80](http://github.com/justindujardin/pow-edit/commit/cd14ae809cf2f17e8c17aa0cfe774cfb3266e298))
* **paneItem:** directive for grouped sections in left pane ([0fe55a59](http://github.com/justindujardin/pow-edit/commit/0fe55a59c1b11be00676721daac3ca2ba33b84da))
* **platform:** run in node-webkit and the browser ([b385fd89](http://github.com/justindujardin/pow-edit/commit/b385fd8928dc5a81d94a2c9529fb33b3118be3c6))
* **textEditorView:** support specifying document mode ([ee498995](http://github.com/justindujardin/pow-edit/commit/ee498995bb89665b4c09a3cc0fe18623dcebaf50))
* **tileEditorView:** layer list with click to toggle visibility ([dd21851a](http://github.com/justindujardin/pow-edit/commit/dd21851a5a87f5e27542fd57c45421270a22756c))


<a name="0.0.2"></a>
### 0.0.2 (2014-05-09)


#### Features

* **editorView:**
  * progress bar loading for maps ([ae3e9b53](http://github.com/justindujardin/pow-edit/commit/ae3e9b53308aa4d5fccdaf2344fe7319a12d4873))
  * 500% faster file loading with layer lookup ([fb1db261](http://github.com/justindujardin/pow-edit/commit/fb1db261e0bed54a7d80924676020cc167a6b229))
* **imageView:** make image view center its content and allow scrolling ([681651f4](http://github.com/justindujardin/pow-edit/commit/681651f498df4d2f8decd50bb70a260da217579a))


<a name="0.0.1"></a>
### 0.0.1 (2014-05-04)


#### Bug Fixes

* **TileMap:** successfully load and render combat and sewer maps ([8af4be09](http://github.com/justindujardin/pow-edit/commit/8af4be096fd82708987c201f3a060b71ef92433e))
* **build:** version bower.json ([6bc143a1](http://github.com/justindujardin/pow-edit/commit/6bc143a1121630830d77b76fc72beabc4dc3b0b1))
* **editorView:** properly clean up pixi and rAF loop on destroy ([f23a56e6](http://github.com/justindujardin/pow-edit/commit/f23a56e640da1b28aedc2eff91e0625b0a6e6f0b))


#### Features

* **Pixi:** add basic pixi js integration for rendering tilemaps ([e1c540b8](http://github.com/justindujardin/pow-edit/commit/e1c540b8452ca71064c45dccab76d8ea6a923d42))
* **TileMap:**
  * center map in view when loading from file tree ([ad86fb3d](http://github.com/justindujardin/pow-edit/commit/ad86fb3d1a2300e40ece71941055110377696eb6))
  * add old eburp tmx maps from pow2 ([e50a25ac](http://github.com/justindujardin/pow-edit/commit/e50a25aca4856095ed1baadd7560720dba63e007))
  * support viewing arbitrary tmx files in app hierarchy ([a255e0fb](http://github.com/justindujardin/pow-edit/commit/a255e0fb6a3ccf60294ca5201ef4c136f7320d72))
  * add support for map zoom ([c327acb9](http://github.com/justindujardin/pow-edit/commit/c327acb9d255f9f0951d39de7f2828ec2b15f98a))
  * super shitty pan around map ([925af2f5](http://github.com/justindujardin/pow-edit/commit/925af2f51f03fd96fbdd5bc59db9e71cc18db819))
  * load and parse Tiled map xml file ([e2080375](http://github.com/justindujardin/pow-edit/commit/e2080375fc09388cb471b4f63d61bfe49d430f1b))
* **appController:** set up explicit document binding for types ([68289b9b](http://github.com/justindujardin/pow-edit/commit/68289b9b05358928b2c2bcaa8402dc9d3235ba72))
* **build:** add grunt release task for version tagging ([3563cc9c](http://github.com/justindujardin/pow-edit/commit/3563cc9ca6aebf71020213c637190df828cb3805))
* **editorView:**
  * asynchronous map loading that can be canceled ([0bbb2aae](http://github.com/justindujardin/pow-edit/commit/0bbb2aaef69d7458349850b3fcab2e61c6716c59))
  * improve map pan by binding to the document mouse events ([618fd545](http://github.com/justindujardin/pow-edit/commit/618fd545953b5a0d5ad36a906e81185f379583ab))
  * show status text while loading maps ([77067893](http://github.com/justindujardin/pow-edit/commit/770678933caf6c7b43949c643a71faf0594b8e0f))
* **examples:** add example maps ([b4dda7f3](http://github.com/justindujardin/pow-edit/commit/b4dda7f3dbd727832e3406f87a1855c50b80a8b4))
* **fileTree:**
  * add viewer for image file types ([9381d42d](http://github.com/justindujardin/pow-edit/commit/9381d42d82210cfcb151e1fb50259e0d72b5f4f0))
  * satisfactory tree styling and selection characteristics ([a4f584c4](http://github.com/justindujardin/pow-edit/commit/a4f584c4e9eeddf5da2482683fc8f0b32c068dce))
  * add basic file tree icon support ([45012d81](http://github.com/justindujardin/pow-edit/commit/45012d81d5a436ae79fffb2402c43f2067c1d736))
  * add full row selection for nodes and depth indentation ([c9da1d64](http://github.com/justindujardin/pow-edit/commit/c9da1d6401272aa71652ca104f30e9d841a0ca9a))
* **tiledLoader:** support inline tile sets ([4c5c54d6](http://github.com/justindujardin/pow-edit/commit/4c5c54d63ef224f095f176ee6926f0f84d414774))


