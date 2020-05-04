import CliKintoneTestBase from './CliKintoneTestBase';
import { executeCommand, hashCsvFile } from './helper';
import { filePaths } from './config';
import { getAttachmentList } from '../utils/csvUtils';
import { getFileContent } from '../utils/fileUtils';
import {
    getAppDataByApi,
    makeJsonDataFile,
    makeJsonDataFileWithAttachment,
    getFileContentByApi,
} from '../utils/kintoneApiUtils';

export default class ImportTestCommon extends CliKintoneTestBase {
    constructor(appInfo, auth, importFile, hasImportArg = true, ...otherArgs) {
        super(appInfo, auth);

        if (typeof importFile === 'undefined') {
            this._importFileArg = '';
        } else {
            this._importFileArg = ` -f ${importFile}`;
            this._importFile = importFile;
        }
        this._otherArgs = otherArgs;
        this._importOption = ' --import';
        if (!hasImportArg) {
            this._importOption = '';
        }
    }

    /**
     * @returns {Promise<string>}
     */
    async importWithUserNamePassword() {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}` +
            this._importOption +
            this._importFileArg;
        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @returns {Promise<string>}
     */
    async importWithUserNameAndInputPassword() {
        let command =
            `echo ${this._auth.password}|` +
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            this._importOption +
            this._importFileArg;
        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {Object} basicAuthUser
     * @returns {Promise<string>}
     */
    async importWithBasicAuth(basicAuthUser) {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}` +
            ` -U ${basicAuthUser.username}` +
            ` -P ${basicAuthUser.password}` +
            this._importOption +
            this._importFileArg;
        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {string} apiToken
     * @returns {Promise<string>}
     */
    async importWithAuthToken(apiToken) {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -t ${apiToken}` +
            this._importOption +
            this._importFileArg;
        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {string} attachmentFolder
     * @returns {Promise<string>}
     */
    async importWithAttachment(attachmentFolder) {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}` +
            this._importOption +
            this._importFileArg +
            ` -b=${attachmentFolder}`;
        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {string} attachmentFolder
     * @returns {Promise<string>}
     */
    async importWithAttachmentByAuthToken(apiToken, attachmentFolder) {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -t ${apiToken}` +
            ` --import -f ${this._importFile}` +
            ` -b=${attachmentFolder}`;
        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }

        const result = await executeCommand(command);
        return result;
    }
    /**
     * @returns {Promise<string>}
     */
    async importWithDuplicateArgument() {
        const command =
            this._kintoneCli +
            ` -a -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}` +
            this._importOption +
            this._importFileArg;

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {Array} fieldNames
     * @param {String} expectedDataFile
     * @param {String} query
     * @param {Object} basicAuth
     * @returns {Promise<void>}
     */
    async verifyImportedData(fieldNames, expectedDataFile, query = '', basicAuth = {}) {
        const actualJsonDataGetFromAppByApi = filePaths.import_test.actualJsonDataGetFromAppByApi;
        await getAppDataByApi(this._appInfo, this._auth, fieldNames, query, basicAuth).then(
            (res, err) => {
                if (err) {
                    console.log(err);
                }
                // console.log(res);
                makeJsonDataFile(res, actualJsonDataGetFromAppByApi);
            }
        );
        const hashOfExpectedImportFile = await hashCsvFile(expectedDataFile);
        const hashOfActualDataFile = await hashCsvFile(actualJsonDataGetFromAppByApi);

        await expect(hashOfActualDataFile).toEqual(hashOfExpectedImportFile);
    }

    /**
     * @param {Array} fieldNames
     * @param {String} expectedDataFile
     * @param {String} query
     * @param {Object} basicAuth
     * @returns {Promise<void>}
     */
    async verifyImportedDataWithAttachment(
        fieldNames,
        expectedDataFile,
        query = '',
        basicAuth = {}
    ) {
        const actualJsonDataGetFromAppByApi = filePaths.import_test.actualJsonDataGetFromAppByApi;
        await getAppDataByApi(this._appInfo, this._auth, fieldNames, query, basicAuth).then(
            (res, err) => {
                if (err) {
                    console.log(err);
                }
                console.log(res);
                makeJsonDataFileWithAttachment(res, actualJsonDataGetFromAppByApi);
            }
        );
        const hashOfExpectedImportFile = await hashCsvFile(expectedDataFile);
        const hashOfActualDataFile = await hashCsvFile(actualJsonDataGetFromAppByApi);

        await expect(hashOfActualDataFile).toEqual(hashOfExpectedImportFile);
    }

    /**
     * @param {[String]} fieldNames
     * @param {String} query
     * @param {Object} basicAuth
     * @returns {Promise<void>}
     */
    async verifyImportedAttachments(fieldNames, query, basicAuth = {}) {
        const expectedFileNames = await getAttachmentList(this._importFile);
        const expectedFileContentArray = [];
        for (const fileName of expectedFileNames) {
            const filePath = filePaths.attachmentFolder + fileName;
            expectedFileContentArray.push(await getFileContent(filePath));
        }

        let getAllRecordsRes;
        await getAppDataByApi(this._appInfo, this._auth, fieldNames, query, basicAuth).then(
            (res, err) => {
                if (err) {
                    console.log(err);
                }
                getAllRecordsRes = res;
            }
        );

        const actualFileNames = [];
        const actualFileContentArray = [];
        for (const record of getAllRecordsRes) {
            const attachmentField = record.Attachment.value;
            if (attachmentField) {
                for (const element of attachmentField) {
                    actualFileNames.push(element.name);
                    const res = await getFileContentByApi(
                        this._appInfo,
                        this._auth,
                        element.fileKey
                    );
                    actualFileContentArray.push(res.toString('utf8'));
                }
            } else {
                actualFileNames.push('');
            }
        }

        // Verify the attachment file name between csv file and data get from app by rest api
        await expect(actualFileNames).toEqual(expect.arrayContaining(expectedFileNames));
        await expect(expectedFileContentArray).toEqual(
            expect.arrayContaining(actualFileContentArray)
        );
    }
}
