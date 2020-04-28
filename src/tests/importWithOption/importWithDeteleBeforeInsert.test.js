import ImportTestCommon from '../../common/ImportTestCommon';
import { filePaths, importTestApps as apps, users } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Delete all records before inserting (-D=true)', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData;
    const importedCSVFileWithAttachment = filePaths.import_test.importCSVDataWithAttachment;
    const attachmentFileFolder = filePaths.attachmentFolder;
    const query = makeQueryToGetAppData();

    test('C100: Verify that all records will be deleted before inserting', async () => {
        // Import data in the first time
        const importTest1 = new ImportTestCommon(appInfo, userCreds, importedCSVFile);
        const result1 = await importTest1.importWithUserNamePassword();

        // Import data in the second time with delete record argument (-D)
        const otherArg = '-D';
        const importTest2 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );
        const result2 = await importTest2.importWithUserNamePassword();

        // Verify cli-kintone success message in the first time
        importTest1.verifyCliKintoneSuccessMessage(result1);
        // Verify cli-kintone success message in the second time
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app just include data from the second import
        const fieldNamesArray = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataExpected;
        await importTest2.verifyImportedData(fieldNamesArray, expectedDataFile, query);
    });

    test('C100: Guest space - Verify that all records will be deleted before inserting', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        // Import data in the first time
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest1 = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            true,
            guestSpaceArg
        );
        const result1 = await importTest1.importWithUserNamePassword();

        // Import data in the second time with delete record argument (-D)
        const otherArg = '-D';
        const importTest2 = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            true,
            otherArg,
            guestSpaceArg
        );
        const result2 = await importTest2.importWithUserNamePassword();

        // Verify cli-kintone success message in the first time
        importTest1.verifyCliKintoneSuccessMessage(result1);
        // Verify cli-kintone success message in the second time
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app just include data from the second import
        const fieldNamesArray = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataGuestSpaceAppExpected;
        await importTest2.verifyImportedData(fieldNamesArray, expectedDataFile, query);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('C101: Verify that all records will be deleted before inserting with attachment file directory (-f -b -D)', async () => {
        // Import data in the first time
        const importTest1 = new ImportTestCommon(appInfo, userCreds, importedCSVFileWithAttachment);
        const result1 = await importTest1.importWithAttachment(attachmentFileFolder);

        // Import data in the second time
        const otherArg = '-D';
        const importTest2 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFileWithAttachment,
            true,
            otherArg
        );
        const result2 = await importTest2.importWithAttachment(attachmentFileFolder);

        // Verify cli-kintone success message in the first time
        importTest1.verifyCliKintoneSuccessMessage(result1);
        // Verify cli-kintone success message in the second time
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app just include data from the second import
        const fieldNames = await getFieldArray(importedCSVFileWithAttachment);
        const expectedDataFile = filePaths.import_test.importCSVDataWithAttachmentExpected;
        await importTest2.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest2.verifyImportedAttachments(fieldNames, query);
    });

    test('C103: Verify that no record will be deleted when not specifying -D', async () => {
        // Import data in the first time
        const importTest1 = new ImportTestCommon(appInfo, userCreds, importedCSVFile, true);
        const result1 = await importTest1.importWithUserNamePassword();

        // Import data in the second time
        const importTest2 = new ImportTestCommon(appInfo, userCreds, importedCSVFile, true);
        const result2 = await importTest2.importWithUserNamePassword();

        // Verify cli-kintone success message in the first time
        importTest1.verifyCliKintoneSuccessMessage(result1);
        // Verify cli-kintone success message in the second time
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app include data from the first, second import
        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithTwoRowExpected;
        await importTest2.verifyImportedData(fieldNames, expectedDataFile, query);
    });

    test('C105: Verify that all records will be deleted before inserting using API Token', async () => {
        // Import data in the first time
        const importTest1 = new ImportTestCommon(appInfo, userCreds, importedCSVFile);
        const result1 = await importTest1.importWithAuthToken(appInfo.apiToken.fullPermission);

        // Import data in the second time
        const otherArg = '-D';
        const importTest2 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );
        const result2 = await importTest2.importWithAuthToken(appInfo.apiToken.fullPermission);

        // Verify cli-kintone success message in the first time
        importTest1.verifyCliKintoneSuccessMessage(result1);
        // Verify cli-kintone success message in the second time
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app just include data from the second import
        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataExpected;
        await importTest2.verifyImportedData(fieldNames, expectedDataFile, query);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
