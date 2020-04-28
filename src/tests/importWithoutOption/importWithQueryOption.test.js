import ImportTestCommon from '../../common/ImportTestCommon';
import { filePaths, importTestApps as apps, users } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import without --import option: Delete selected records (by -q param) before inserting', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVDataWithQuery;

    test('C267: Verify that records will be deleted according to the query before inserting', async () => {
        const queryArg = '-D -q "Number > 1000"';
        const importTest1 = new ImportTestCommon(appInfo, userCreds, importedCSVFile, true);
        const importTest2 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            false,
            queryArg
        );

        const result1 = await importTest1.importWithUserNamePassword();
        const result2 = await importTest2.importWithUserNamePassword();

        // Verify cli-kintone success message
        importTest1.verifyCliKintoneSuccessMessage(result1);

        // Verify cli-kintone success message
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app
        const fieldNames = await getFieldArray(importedCSVFile);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importCSVDataWithQueryExpected;
        await importTest2.verifyImportedData(fieldNames, expectedDataFile, query);
    });

    test('C267: Guest space - Verify that records will be deleted according to the query before inserting', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        const queryArg = '-D -q "Number > 1000"';
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest1 = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            false,
            guestSpaceArg
        );
        const importTest2 = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            false,
            queryArg,
            guestSpaceArg
        );

        const result1 = await importTest1.importWithUserNamePassword();
        const result2 = await importTest2.importWithUserNamePassword();

        // Verify cli-kintone success message
        importTest1.verifyCliKintoneSuccessMessage(result1);

        // Verify cli-kintone success message
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app
        const fieldNames = await getFieldArray(importedCSVFile);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importCSVDataWithQueryExpected;
        await importTest2.verifyImportedData(fieldNames, expectedDataFile, query);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
