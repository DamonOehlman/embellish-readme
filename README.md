# embellish

Embellish is a simple utility to add various embellishments to your projects
README (or other markdown files).

[![NPM](https://nodei.co/npm/embellish-readme.png)](https://nodei.co/npm/embellish-readme/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) [![Maintainability](https://api.codeclimate.com/v1/badges/f23f4341a91e917eac0f/maintainability)](https://codeclimate.com/github/DamonOehlman/embellish-readme/maintainability)

## General usage

Once installed (either globally or locally to your project):

```
embellish <targetfile>
```

e.g. `embellish README.md`

## Features

### Auto insertion of project badges

Let's face it, badges are the hotness.  Adding them to your readme though is a pain.  May as well let a tool do that for you instead.  Embelish can add (and update) various relevant project badges to your `README.md` file.  The insertion position is after the first paragraph after the first `H1` defined in your markdown file (and right before the next heading).

### Auto insertion of license information

When embellishing a README file, a search is done for a `## LICENSE` header.  After this header all existing content is remove and an applicable license description added for the project license as described in the project `package.json` file.

This also generates the appropriate `LICENSE` file in the current working directory.

**NOTE:** In the event that you wish to display a difference licence holder to the author information
that is contained within `package.json` simply add the following to your `package.json` file:

```json
{
  "name": "foo",
  ...,
  "embellish": {
    "licenseHolder": "Acme Corp"
  }
}
```

### Auto insertion of examples

_Upcoming feature._

When updating the target markdown file, `embellish` will check for the presence of an `examples` directory in the current working directory.  If found, it will then iterate through the child directories and include each of the examples in the target file.  It will include two things:

1. The content of any `README.md` found in the `examples/[example]/` directory.
2. The content of any `index.js` file found in the `examples/[example]/` directory as a GHFM code block.

This technique currently works well for browserify friendly demos, however, more work is to be done to achieve compatibility with other tooling.

## LICENSE

The MIT License (MIT)

Copyright (c) 2023 Damon Oehlman <damon.oehlman@gmail.com>

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
