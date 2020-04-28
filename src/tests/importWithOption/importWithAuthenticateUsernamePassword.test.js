import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import errorMessage from '../../common/kintoneCliErrorMessage.json';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Authenticate with username/password (-u) (-p)', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData;
    const expectedDataFile = filePaths.import_test.importCSVDataExpected;

    test('C011: Verify that data is imported correctly with username/password for an app', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C011: Guest space - Verify that data is imported correctly with username/password for an app', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            true,
            guestSpaceArg
        );

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedFile = filePaths.import_test.importCSVDataGuestSpaceAppExpected;
        await importTest.verifyImportedData(fieldNames, expectedFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('C012 - Verify that error will be displayed when importing data with wrong username', async () => {
        const invalidAuth = { username: 'invalidUserName', password: userCreds.password };
        const importTest = new ImportTestCommon(appInfo, invalidAuth, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.INVALID_USER_PASSWORD_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C013 - Verify that error will be displayed when importing data with wrong password', async () => {
        const invalidAuth = { username: userCreds.username, password: 'wrongPassword' };
        const importTest = new ImportTestCommon(appInfo, invalidAuth, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.INVALID_USER_PASSWORD_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C015 - When not providing password: Input correct password and verify that data is imported correctly', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithUserNameAndInputPassword();

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C016 - When not providing password: Input wrong password and verify that error will be displayed', async () => {
        const invalidAuth = { username: userCreds.username, password: 'wrongPassword' };
        const importTest = new ImportTestCommon(appInfo, invalidAuth, importedCSVFile);

        const result = await importTest.importWithUserNameAndInputPassword();

        const expectedError = errorMessage.INVALID_USER_PASSWORD_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C017 - Verify that error will be displayed with user who doesn’t have View record permission for an app', async () => {
        const importTest = new ImportTestCommon(
            appInfo,
            users.userNoViewPermission,
            importedCSVFile
        );

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.PERMISSION_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C018 - Verify that error will be displayed when executing command with wrong App ID', async () => {
        const invalidApp = apps.normalSpaceApp;
        invalidApp.appId = 99999;
        const importTest = new ImportTestCommon(invalidApp, userCreds, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        const expectedError = errorMessage.INVALID_APP_ID_ERROR;
        expectedError.message = expectedError.message.replace('%APP_ID%', invalidApp.appId);
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C019 - Verify that error will be displayed when executing command with wrong Domain', async () => {
        const invalidApp = apps.normalSpaceApp;
        invalidApp.domain = 'invalid_domain';
        const importTest = new ImportTestCommon(invalidApp, userCreds, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyHttpError404Message(result);
    });

    test('C020 - Verify that error will be displayed when executing command with wrong Domain and App', async () => {
        const invalidApp = apps.invalidApp;
        const importTest = new ImportTestCommon(invalidApp, userCreds, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyHttpError404Message(result);
    });

    test('C021 - Verify that error will be displayed when executing with duplicated params', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithDuplicateArgument();

        expect(result.toString()).toEqual(
            expect.stringContaining('expected argument for flag `-a')
        );
        expect(result.toString()).toEqual(expect.stringContaining('but got option `-a'));
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
