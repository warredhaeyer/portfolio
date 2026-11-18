# Third-party notices

The application uses ASCII Reveal by Quan Hoang (MIT), React (MIT), Tailwind CSS (MIT), Lucide (ISC, including Feather MIT notices), and Geist/Geist Mono (SIL OFL 1.1). Vite emits bundled JavaScript dependency notices in `dist/dependency-licenses.txt`. Font copyright and license notices are in `public/licenses/Geist-OFL.txt`, copied to `dist/licenses/Geist-OFL.txt` during builds. Keep these files with distributed builds.

The design is inspired by the [ASCII Reveal demo](https://github.com/quanhoangindex/ascii-reveal), pinned at commit `ec413f44933e4c08df202edaaed83ce77c342c3e`. The package is installed directly from GitHub; no separate reference checkout is needed.

The active renderer in `src/vendor/storm-dragons.ts` is adapted from that revision's `demo/src/home/dragons.ts`, by Quan Hoang, under the MIT license below. The adjacent `LICENSE.ascii-reveal` retains its copyright and license. Scene theme values and the ruled-layout visual approach are also adapted from the demo. The portfolio thumbnail is a screenshot of this site; the two future-project SVGs are abstract illustrations, not screenshots of completed projects.

## ascii-reveal

`StormDragonsScene.tsx` integrates the adapted renderer with React. Changes include serpentine body proportions, antler crowns, animated whiskers, crystalline spines and blade wings, blue/violet/jade palettes, plasma breath, mobile sizing, text protection, a 30fps cap, live reduced-motion handling, and improved offscreen/hidden-tab scheduling and cleanup. This is an attributed adaptation, not an independently authored rendering engine.

ASCII Reveal also powers heading and project-image scroll effects.

MIT License

Copyright (c) 2026 Quan Hoang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
