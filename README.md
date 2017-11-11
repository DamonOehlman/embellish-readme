# embelish

Embelish is a simple utility to add various embelishments to your projects README (or other markdown files).

[![NPM](https://nodei.co/npm/gendocs.png)](https://nodei.co/npm/gendocs/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) [![bitHound Score](https://www.bithound.io/github/DamonOehlman/gendocs/badges/score.svg)](https://www.bithound.io/github/DamonOehlman/gendocs) 

## Features

### Auto insertion of project badges

Let's face it, badges are the hotness.  Adding them to your readme though is a pain.  May as well let a tool do that for you instead.  Embelish can add (and update) various relevant project badges to your `README.md` file.  The insertion position is after the first paragraph after the first `H1` defined in your markdown file (and right before the next heading).

## Auto insertion of license information

When embelishing a README file, a search is done for a `## LICENSE` header.  After this header all existing content is remove and an applicable license description added for the project license as described in the project `package.json` file. 

## Auto insertion of examples

**Upcoming feature.**

## LICENSE
