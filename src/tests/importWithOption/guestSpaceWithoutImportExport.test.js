import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import errorMessage from '../../common/kintoneCliErrorMessage.json';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Other: Testing on guest space without using import/export function', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;

    test('C132: Verify that error will be displayed when user input string for -g param', async () => {
        const guestSpaceArg = '-g abc';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            undefined,
            false,
            guestSpaceArg
        );

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.INVALID_GUEST_SPACE_ARGUMENT_PARSING_ERROR;
        expectedError.message = expectedError.message.replace('%VALUE%', 'abc');
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C133: Verify that error will be displayed when user input negative number for -g param', async () => {
        const guestSpaceArg = '-g -5';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            undefined,
            false,
            guestSpaceArg
        );

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.INVALID_GUEST_SPACE_ARGUMENT_ERROR;
        expectedError.message = expectedError.message.replace('%VALUE%', '-5');
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test.skip('C134: Verify that if user specify the value of -g as 0, -g param will be ignored', async () => {
        // -- Prepare data
        const preparedCSVFile = filePaths.export_test.exportDataPreparation;
        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithUserNamePassword();

        // -- Execute cli-kintone command with -g = 0 (ignore guest app, it means data will be exported from normal app)
        let fieldNames = await getFieldArray(preparedCSVFile);
        // Remove field names which their values are incremental ids
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
        const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
        const guestSpaceArg = `-g 0 -c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            guestSpaceArg
        );

        await exportTest.exportWithUserNamePassword();

        // -- Verify data is exported from normal app
        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
