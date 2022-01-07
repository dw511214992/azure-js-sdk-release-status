#!/usr/bin/env node

import {getDeprecatedPackagesOfNode} from "./azureSdkForNode";
import {getPackagesOfJs} from "./azureSdkForJs";
import * as fs from "fs";

async function main() {
    console.log("======= NODE SDK==============");
    const deprecatedNodeSdk = await getDeprecatedPackagesOfNode('D:/projects/azure-sdk-for-node');

    console.log("======= Track1 SDK==============");
    const {deprecatedTrack1Sdk, notReleaseTrack2Sdk, stableReleaseTrack2Sdk, previewReleaseTrack2Sdk} = await getPackagesOfJs('D:/projects/azure-sdk-for-js');

    const result = `# JS MGMT SDK Release Process
All data comes from NPM.

${stableReleaseTrack2Sdk.length > 0 ?
        `## Packages that Stable Release in Track2
|  PackageName   | Version  | Url |
|  :----:  | :----:  | :----: |` : ''}
${stableReleaseTrack2Sdk.join('\n')}

${previewReleaseTrack2Sdk.length > 0 ?
        `## Packages that Preview Release in Track2
|  PackageName   | Version  | Url |
|  :----:  | :----:  | :----: |` : ''}
${previewReleaseTrack2Sdk.join('\n')}

${notReleaseTrack2Sdk.length > 0 ?
        `## Packages that still Release in Track1
|  PackageName   | Version  | Url |
|  :----:  | :----:  | :----: |` : ''}
${notReleaseTrack2Sdk.join('\n')}

${deprecatedTrack1Sdk.length > 0 ?
        `## Deprecated Packages in azure-sdk-for-js because of Stable Release in Track2
|  PackageName   | Version  | Url |
|  :----:  | :----:  | :----: |` : ''}
${deprecatedTrack1Sdk.join('\n')}

${deprecatedNodeSdk.length > 0 ?
        `## Deprecated Packages in azure-sdk-for-node
|  PackageName   | Version  | Url |
|  :----:  | :----:  | :----: |` : ''}
${deprecatedNodeSdk.join('\n')}
    `

    fs.writeFileSync('Readme.md', result);

}

main().catch(e => {
    console.log(e.message);
});
