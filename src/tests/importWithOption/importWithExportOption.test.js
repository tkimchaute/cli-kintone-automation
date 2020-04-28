import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import errorMessage from '../../common/kintoneCliErrorMessage.json';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Import function in combination with export function', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData;

    test('C121: Verify that error will be displayed when using both --import and --export', async () => {
        const otherArg = '--export';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.IMPORT_EXPORT_SPECIFIED_TOGETHER_COMMAND_ERROR;
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C122 - Verify that error will be displayed when using both -import and -export', async () => {
        const otherArg = '-import -export';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            false,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.UNKNOWN_FLAG_COMMAND_ERROR;
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    // Skip this case due to actual result is incorrect
    // TODO: add issue into BTS
    test.skip('C123: Verify that error will be displayed when using both <, >', async () => {
        const otherArg = '><';
        const importTest = new ImportTestCommon(appInfo, userCreds, undefined, true, otherArg);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = '< was unexpected at this time.';
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    // Skip this case due to actual result is incorrect
    // TODO: add issue into BTS
    test.skip('C124: Verify that error will be displayed when using both <, >', async () => {
        const otherArg = '><';
        const importTest = new ImportTestCommon(appInfo, userCreds, undefined, true, otherArg);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = '> was unexpected at this time.';
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C125: Verify that error will be displayed when using both --export and -f', async () => {
        const otherArg = '--export';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            false,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        const expectedError = 'The -f option is not supported with the --export option.';
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C126: Verify that error will be displayed when using both -export and -f', async () => {
        const otherArg = '-export';
        const importTest = new ImportTestCommon(appInfo, userCreds, '', false, otherArg);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = "expected argument for flag `-f', but got option `-export'";
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C128: Verify that error will be displayed when using both -import and >', async () => {
        const otherArg = `-import < ${importedCSVFile} > exported.csv`;
        const importTest = new ImportTestCommon(appInfo, userCreds, undefined, false, otherArg);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = 'unknown flag `i';
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C129: Verify that if user specify both stdin and file then file will take higher priority', async () => {
        const importedCSVFile2 = filePaths.import_test.importCSVData2;
        const otherArg = `< ${importedCSVFile} -f ${importedCSVFile2}`;
        const importTest = new ImportTestCommon(appInfo, userCreds, undefined, true, otherArg);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile2);
        const expectedDataFile = filePaths.import_test.importCSVData2Expected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
