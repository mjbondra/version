# @wondermonger/version

A simple utility for semantic versioning.

## Installation

```shell
npm i -g @wondermonger/version
```

**OR**

```shell
yarn global add @wondermonger/version
```

## Usage

This utility does not create new tags, nor does it modify any files, it simply writes non-conflicting version numbers to stdout.

```shell
# new prerelease version
git tag | wondermonger-version --new-version prerelease

# new patch version
git tag | wondermonger-version --new-version patch

# new minor version
git tag | wondermonger-version --new-version minor

# new major version
git tag | wondermonger-version --new-version major

# explicit version
git tag | wondermonger-version --new-version 2.0.0-alpha
```

**Sources**

Pipe any new-line separated list of semantic versions to the `wondermonger-version` utility. In the absence of a version file, incrementation will happen relative to the latest version.

```shell
versions=$(git tag)
echo $versions | wondermonger-version --new-version patch

versions="v1.0.0-alpha\nv1.0.0\nv1.0.1"
echo $versions | wondermonger-version --prefix "v" --new-version patch
```

**Flags**

**--new-version**

 Versioning strategy (`prepublish`, `patch`, `minor`, `major`) or an explicit version.

**--prefix**

Optional character(s) that preceed version.

**--version-file**

Optional file containing a single semantic version against which incrementation should occur.

## License

The MIT License (MIT)

Copyright (c) 2017 Michael J. Bondra <mjbondra@gmail.com>

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
