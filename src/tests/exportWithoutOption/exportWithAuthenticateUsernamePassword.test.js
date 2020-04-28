import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';
import errorMessage from '../../common/kintoneCliErrorMessage';

describe('Export without --export option: Authenticate with username/password (-u) (-p)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    let fieldNames = '';

    test('Case 280: Verify that data is exported correctly with username/password for an app', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );

        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 280: Guest space - Verify that data is exported correctly with username/password for an app', async () => {
        const guestSpaceApp = apps.guestSpaceApp.appWithoutAttachment;
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;

        // Remove old data if any, then prepare test data for app in guest space
        await deleteAllAppData(guestSpaceApp, userCreds);
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            preparedCSVFile,
            true,
            guestSpaceArg
        );
        await importTest.importWithUserNamePassword();

        // Test exporting data
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            guestSpaceApp,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            guestSpaceArg
        );

        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('C281 - Verify that error will be displayed when exporting data with wrong username', async () => {
        const invalidAuth = { username: 'invalidUserName', password: userCreds.password };
        const exportTest = new ExportTestCommon(
            appInfo,
            invalidAuth,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNamePassword();

        const expectedError = errorMessage.INVALID_USER_PASSWORD_ERROR;
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C282 - Verify that error will be displayed when exporting data with wrong password', async () => {
        const invalidAuth = { username: userCreds.username, password: 'wrongPassword' };
        const exportTest = new ExportTestCommon(
            appInfo,
            invalidAuth,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNamePassword();

        const expectedError = errorMessage.INVALID_USER_PASSWORD_ERROR;
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C284 - When not providing password: Input correct password and verify that data is exported correctly', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );

        await exportTest.exportWithUserNameAndInputPassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataWithInputPasswordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('C285 - When not providing password: Input wrong password and verify that error will be displayed', async () => {
        const invalidAuth = { username: userCreds.username, password: 'wrongPassword' };
        const exportTest = new ExportTestCommon(
            appInfo,
            invalidAuth,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNameAndInputPassword();

        const expectedError = errorMessage.INVALID_USER_PASSWORD_ERROR;
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C286 - Verify that error will be displayed with user who doesn’t have View record permission for an app', async () => {
        const exportTest = new ExportTestCommon(
            appInfo,
            users.userNoViewPermission,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNamePassword();

        const expectedError = errorMessage.PERMISSION_ERROR;
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C287 - Verify that error will be displayed when executing command with wrong App ID', async () => {
        const invalidApp = apps.normalSpaceApp.appWithoutAttachment;
        invalidApp.appId = 99999;
        const exportTest = new ExportTestCommon(
            invalidApp,
            userCreds,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNamePassword();

        const expectedError = errorMessage.INVALID_APP_ID_ERROR;
        expectedError.message = expectedError.message.replace('%APP_ID%', invalidApp.appId);
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C288 - Verify that error will be displayed when executing command with wrong Domain', async () => {
        const invalidApp = apps.normalSpaceApp.appWithoutAttachment;
        invalidApp.domain = 'invalid_domain';
        const exportTest = new ExportTestCommon(
            invalidApp,
            userCreds,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNamePassword();

        exportTest.verifyHttpError404Message(result);
    });

    test('C289 - Verify that error will be displayed when executing command with wrong Domain and App', async () => {
        const invalidApp = apps.invalidApp;
        const exportTest = new ExportTestCommon(
            invalidApp,
            userCreds,
            actualExportedDataFile,
            false
        );

        const result = await exportTest.exportWithUserNamePassword();

        exportTest.verifyHttpError404Message(result);
    });

    test('C290 - Verify that error will be displayed when executing with duplicated params', async () => {
        const exportTest = new ExportTestCommon(appInfo, userCreds, actualExportedDataFile, false);

        const result = await exportTest.exportWithDuplicateArgument();

        expect(result.toString()).toEqual(
            expect.stringContaining('expected argument for flag `-a')
        );
        expect(result.toString()).toEqual(expect.stringContaining('but got option `-a'));
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);

        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithUserNamePassword();

        fieldNames = await getFieldArray(preparedCSVFile);
        // Remove some field names which their values are incremental ids
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
