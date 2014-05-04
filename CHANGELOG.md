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


