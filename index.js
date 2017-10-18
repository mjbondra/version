'use strict';

const { promisify } = require('util');
const { readFile } = require('fs');
const { argv } = require('yargs');

const { newVersion, versionFile, prefix = '' } = argv;
const readFileAsync = promisify(readFile);

const isInt = /^[0-9]+$/;
const isVer = new RegExp(`^${prefix}[0-9]+\\.[0-9]+\\.[0-9]+(-[0-9A-Za-z.-]*[0-9A-Za-z]+)*$`);
const versions = [];

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const input = process.stdin.read();

  if (input !== null) {
    input.split('\n')
      .filter(version => isVer.test(version))
      .forEach(version => versions.push(version));

    versions.sort((a, b) => {
      const [ aVersion, aPreRelease ] = a.replace(prefix, '')
        .split('-')
        .map(val => isInt.test(val) ? +val : val);
      const [ bVersion, bPreRelease ] = b.replace(prefix, '')
        .split('-')
        .map(val => isInt.test(val) ? +val : val);

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
  let version;

  try {
    version = versionFile
      ? await readFileAsync(versionFile, 'utf8')
      : versions[versions.length - 1] || `${prefix}1.0.0-0`;
  } catch (err) {
    process.stderr.write(`unable to retrieve version from ${versionFile}\n`);
    return process.exit(1);
  }

  let [ release, preRelease ] = version.replace(prefix, '')
    .split('-')
    .map(val => isInt.test(val) ? +val : val);

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
      if (typeof preRelease === 'undefined') patch++;
      preRelease = undefined;
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
      if (isVer.test(newVersion)) {
        [ release, preRelease ] = newVersion.split('-').map(val => isInt.test(val) ? +val : val);
        [ major, minor, patch ] = release.split('.').map(num => +num);
      } else {
        process.stderr.write(`${newVersion} is not a valid semantic version\n`);
        return process.exit(1);
      }
      break;
  }

  if (typeof preRelease === 'undefined') {
    version = `${prefix}${major}.${minor}.${patch}`;
  } else {
    version = `${prefix}${major}.${minor}.${patch}-${preRelease}`;
  }

  if (versions.includes(version)) {
    process.stderr.write(`${version} already exists\n`);
    return process.exit(1);
  }

  return process.stdout.write(`${version}\n`);
});
