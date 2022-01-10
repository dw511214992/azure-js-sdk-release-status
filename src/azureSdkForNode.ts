import * as fs from "fs";
import * as path from "path";

const axios = require('axios')

export async function getDeprecatedPackagesOfNode(repoPath: string) {
    if (!fs.existsSync(repoPath)) {
        throw new Error(`Cannot find ${repoPath}`);
    }
    const result = [];
    for (const rp of fs.readdirSync(path.join(repoPath, 'lib', 'services'))) {
        if (fs.lstatSync(path.join(repoPath, 'lib', 'services', rp)).isDirectory()) {
            const packagePath = path.join(repoPath, 'lib', 'services', rp, 'package.json');
            if (fs.existsSync(packagePath)) {
                const content = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
                const packageName = content.name;
                if (packageName.startsWith('azure-arm-')) {
                    console.log(`====== Process ${packageName} ======`)
                    const response = await axios.get(`https://registry.npmjs.com/${packageName}`);
                    const info = response.data;
                    const packageVersion = info['dist-tags']['latest'];
                    const url = `https://www.npmjs.com/package/${packageName}`;
                    let replacedPackage = '';
                    if (info['versions'][packageVersion]?.deprecated) {
                        const deprecatedMessage: string = info[packageVersion]?.deprecated;
                        const match = /@azure\/arm-[a-z0-9]*/.exec(deprecatedMessage);
                        if (match && match.length === 1) {
                            replacedPackage = match[0];
                        }
                    }
                    result.push(`| ${packageName} | ${packageVersion} | ${url} | ${replacedPackage} |`);
                }
            }
        }
    }
    return result;
}
