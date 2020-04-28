import * as Path from 'path';
const fs = require('fs');

const getFileContent = async filePath => {
    return new Promise(resolve => {
        fs.readFile(filePath, 'utf8', function(err, contents) {
            resolve(contents);
        });
    });
};

const deleteFolderRecursive = async path => {
    if (fs.existsSync(path)) {
        await fs.readdirSync(path).forEach((file, index) => {
            const curPath = Path.join(path, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        await fs.rmdirSync(path);
    }
};

module.exports = { getFileContent, deleteFolderRecursive };
