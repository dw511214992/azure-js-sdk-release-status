import * as fs from "fs";
import * as path from "path";

const axios = require('axios')
const stable = require('semver-stable');

export async function getPackagesOfJs(repoPath: string) {
    if (!fs.existsSync(repoPath)) {
        throw new Error(`Cannot find ${repoPath}`);
    }
    const deprecatedTrack1Sdk = [];
    const notReleaseTrack2Sdk = [];
    const stableReleaseTrack2Sdk = [];
    const previewReleaseTrack2Sdk = [];
    for (const rp of fs.readdirSync(path.join(repoPath, 'sdk'))) {
        if (fs.lstatSync(path.join(repoPath, 'sdk', rp)).isDirectory()) {
            for (const subPackage of fs.readdirSync(path.join(repoPath, 'sdk', rp))) {
                if (fs.lstatSync(path.join(repoPath, 'sdk', rp, subPackage)).isDirectory()) {
                    const packagePath = path.join(repoPath, 'sdk', rp, subPackage, 'package.json');
                    if (fs.existsSync(packagePath)) {
                        const content = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
                        const packageName = content.name;
                        if (packageName.startsWith('@azure/arm-')) {
                            console.log(`====== Process ${packageName} ======`)
                            const response = await axios.get(`https://registry.npmjs.com/${packageName}`);
                            const info = response.data;
                            const latestPackageVersion = info['dist-tags']['latest'];
                            const betaPackageVersion = info['dist-tags']['next'];
                            const url = `https://www.npmjs.com/package/${packageName}`;
                            if (info['versions'][latestPackageVersion] && info['versions'][latestPackageVersion]['sdk-type'] === 'mgmt') { // stable release track2
                                stableReleaseTrack2Sdk.push(`| ${packageName} | ${latestPackageVersion} | ${url} |`)
                                // find last track1
                                const stableVersions = Object.keys(info['versions']).filter((value, index, array) => {
                                    return stable.is(value);
                                });
                                for (let index = stableVersions.length - 1; index >= 0; index--) {
                                    if (info['versions'][stableVersions[index]] && info['versions'][stableVersions[index]]['sdk-type'] === 'mgmt') {
                                        continue;
                                    }
                                    deprecatedTrack1Sdk.push(`| ${packageName} | ${stableVersions[index]} | ${url} |`);
                                    break;
                                }
                            } else if (!!betaPackageVersion && info['versions'][betaPackageVersion] && info['versions'][betaPackageVersion]['sdk-type'] === 'mgmt') { // preview release track2
                                previewReleaseTrack2Sdk.push(`| ${packageName} | ${betaPackageVersion} | ${url} |`)
                            } else { // not release track2
                                notReleaseTrack2Sdk.push(`| ${packageName} | ${latestPackageVersion} | ${url} |`)
                            }
                        }
                    }
                }
            }
        }
    }
    return {
        'deprecatedTrack1Sdk': deprecatedTrack1Sdk,
        'notReleaseTrack2Sdk': notReleaseTrack2Sdk,
        'stableReleaseTrack2Sdk': stableReleaseTrack2Sdk,
        'previewReleaseTrack2Sdk': previewReleaseTrack2Sdk
    };
}
