'use strict';

const cwd = process.cwd();
const path = `${cwd}/package.json`;
const pkg = require(path);

const versionValidate = /^[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}$/
const versions = [];

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const input = process.stdin.read();

  if (input !== null) {
    input.split('\n')
      .filter(version => versionValidate.test(version))
      .forEach(version => versions.push(version));

    versions.sort((a, b) => {
      const [ aMajor, aMinor, aPatch ] = a.split('.').map(num => +num);
      const [ bMajor, bMinor, bPatch ] = b.split('.').map(num => +num);

      if (aMajor > bMajor) return 1;
      if (aMajor < bMajor) return -1;
      if (aMinor > bMinor) return 1;
      if (aMinor < bMinor) return -1;
      if (aPatch > bPatch) return 1;
      if (aPatch < bPatch) return -1;
      return 0;
    });
  }
});

process.stdin.on('end', () => {
  let version = pkg.version;
  let [ major, minor, patch ] = version.split('.').map(num => +num);

  while (versions.includes(version)) {
    version = pkg.version = `${major}.${minor}.${++patch}`;
  }

  process.stdout.write(`${version}\n`);
});
