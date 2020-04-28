import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import without --import option: Import new data with file (-f)', () => {
    const appInfo = apps.normalSpaceApp;
    const adminUser = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData;
    const expectedDataFile = filePaths.import_test.importCSVDataExpected;

    test('C220: Verify that data of current cli-kintone folder is imported when specifying -f parameter (e.g.. -f test.csv)', async () => {
        const importTest = new ImportTestCommon(appInfo, adminUser, importedCSVFile, false);
        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);
        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C220: Guest space - Verify that data of current cli-kintone folder is imported when specifying -f parameter (e.g.. -f test.csv)', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, adminUser);

        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            adminUser,
            importedCSVFile,
            false,
            guestSpaceArg
        );
        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);
        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedFile = filePaths.import_test.importCSVDataGuestSpaceAppExpected;
        await importTest.verifyImportedData(fieldNames, expectedFile);

        await deleteAllAppData(guestSpaceApp, adminUser);
    });

    test('C224: Verify that import function will work correctly regardless of the value of -e encoding parameter', async () => {
        const encodingArg = '-e euc-jp';
        const importTest = new ImportTestCommon(
            appInfo,
            adminUser,
            importedCSVFile,
            false,
            encodingArg
        );
        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);
        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C225: Verify that import function will work correctly regardless of the value of -c parameter (field code)', async () => {
        const fieldCodeArg = '-c Number,Link,Text_area';
        const importTest = new ImportTestCommon(
            appInfo,
            adminUser,
            importedCSVFile,
            false,
            fieldCodeArg
        );
        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);
        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, adminUser);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, adminUser);
    });
});
