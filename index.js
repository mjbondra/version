'use strict';

const { promisify } = require('util');
const { readFile } = require('fs');
const { argv } = require('yargs');

const readFileAsync = promisify(readFile);

const isInt = /^[0-9]{1,}$/;
const isSemVer = /^[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}(-[0-9A-Za-z.-]{0,}[0-9A-Za-z]{1,}){0,}$/;
const versions = [];

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const input = process.stdin.read();

  if (input !== null) {
    input.split('\n')
      .filter(version => isSemVer.test(version))
      .forEach(version => versions.push(version));

    versions.sort((a, b) => {
      const [ aVersion, aPreRelease ] = a.split('-').map(val => isInt.test(val) ? +val : val);
      const [ bVersion, bPreRelease ] = b.split('-').map(val => isInt.test(val) ? +val : val);
      const [ aMajor, aMinor, aPatch ] = aVersion.split('.').map(num => +num);
      const [ bMajor, bMinor, bPatch ] = bVersion.split('.').map(num => +num);

      const aIsExclusivePreRelease =
        typeof aPreRelease !== 'undefined' && typeof bPreRelease === 'undefined';
      const bIsExclusivePreRelease =
        typeof aPreRelease === 'undefined' && typeof bPreRelease !== 'undefined';

      if (aMajor > bMajor) return 1;
      if (aMajor < bMajor) return -1;
      if (aMinor > bMinor) return 1;
      if (aMinor < bMinor) return -1;
      if (aPatch > bPatch) return 1;
      if (aPatch < bPatch) return -1;
      if (bIsExclusivePreRelease || aPreRelease > bPreRelease) return 1;
      if (aIsExclusivePreRelease || aPreRelease < bPreRelease) return -1;
      return 0;
    });
  }
});

process.stdin.on('end', async () => {
  const { newVersion, versionFile } = argv;
  let version;

  try {
    version = versionFile
      ? await readFileAsync(versionFile, 'utf8')
      : versions[versions.length - 1];
  } catch (err) {
    process.stderr.write(`unable to retrieve version from ${versionFile}\n`);
    return process.exit(1);
  }

  let [ release, preRelease ] = version.split('-').map(val => isInt.test(val) ? +val : val);
  let [ major, minor, patch ] = release.split('.').map(num => +num);

  switch (newVersion) {
    case 'prerelease':
      if (isInt.test(preRelease)) preRelease++;
      else {
        if (typeof preRelease === 'undefined') patch++;
        preRelease = 0;
      }
      break;

    case 'patch':
      preRelease = undefined;
      patch++;
      break;

    case 'minor':
      preRelease = undefined;
      patch = 0;
      minor++;
      break;

    case 'major':
      preRelease = undefined;
      patch = 0;
      minor = 0;
      major++;
      break;

    default:
      if (isSemVer.test(newVersion)) {
        [ release, preRelease ] = newVersion.split('-').map(val => isInt.test(val) ? +val : val);
        [ major, minor, patch ] = release.split('.').map(num => +num);
      } else {
        process.stderr.write(`${newVersion} is not a valid semantic version\n`);
        return process.exit(1);
      }
      break;
  }

  if (typeof preRelease === 'undefined') {
    version = `${major}.${minor}.${patch}`;
  } else {
    version = `${major}.${minor}.${patch}-${preRelease}`;
  }

  if (versions.includes(version)) {
    process.stderr.write(`${version} already exists\n`);
    return process.exit(1);
  }

  return process.stdout.write(`${version}\n`);
});
