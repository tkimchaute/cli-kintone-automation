import ImportTestCommon from '../../common/ImportTestCommon';
import { filePaths, importTestApps as apps, users } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import errorMessage from '../../common/kintoneCliErrorMessage.json';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Import data with (-l) param', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importDataWithLineParam;
    const importedCSVFileWithAttachment = filePaths.import_test.importCSVDataWithAttachment;
    const attachmentFileFolder = filePaths.attachmentFolder;

    test('C110: Verify that user can specify which line will be imported from file and data will be imported correctly', async () => {
        const otherArg = '-l 10';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        // Verify cli-kintone success message
        importTest.verifyCliKintoneSuccessMessage(result);

        // Verify imported data from kintone app
        const fieldNames = await getFieldArray(importedCSVFile);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importDataWithLineParamExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile, query);
    });

    test('C110: Guest space - Verify that user can specify which line will be imported from file and data will be imported correctly', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        const otherArg = '-l 10';
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            true,
            otherArg,
            guestSpaceArg
        );

        const result = await importTest.importWithUserNamePassword();

        // Verify cli-kintone success message
        importTest.verifyCliKintoneSuccessMessage(result);

        // Verify imported data from kintone app
        const fieldNames = await getFieldArray(importedCSVFile);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importDataWithLineParamExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile, query);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('C112: Verify that user can specify the first row in input file which contains header by -l 1', async () => {
        const otherArg = '-l 1';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        // Verify cli-kintone success message
        importTest.verifyCliKintoneSuccessMessage(result);

        // Verify imported data from kintone app
        const fieldNamesArray = await getFieldArray(importedCSVFile);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importDataWithLineParamEqual1Expected;
        await importTest.verifyImportedData(fieldNamesArray, expectedDataFile, query);
    });

    test('C113: Verify that if user specify invalid number, error will be displayed', async () => {
        const invalidLineNumber = -10;
        const otherArg = `-l ${invalidLineNumber}`;
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        // Verify cli-kintone error message
        const expectedError = errorMessage.INVALID_LINE_ERROR;
        expectedError.message = expectedError.message.replace(
            '%INVALID_LINE_NUMBER%',
            invalidLineNumber
        );
        importTest.verifyErrorCommandFailed(result, expectedError);
    });

    test('C114: verify that user can specify which line will be imported from file (-f -D -b -l)', async () => {
        const otherArg = '-l 1 -D';
        const importTest1 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFileWithAttachment,
            true
        );
        const importTest2 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFileWithAttachment,
            true,
            otherArg
        );

        const result1 = await importTest1.importWithAttachment(attachmentFileFolder);
        const result2 = await importTest2.importWithAttachment(attachmentFileFolder);

        // Verify cli-kintone success message
        importTest1.verifyCliKintoneSuccessMessage(result1);

        // Verify cli-kintone success message
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app
        const fieldNamesArray = await getFieldArray(importedCSVFileWithAttachment);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importCSVDataWithAttachmentExpected;
        await importTest2.verifyImportedDataWithAttachment(
            fieldNamesArray,
            expectedDataFile,
            query
        );
        await importTest2.verifyImportedAttachments(fieldNamesArray, query);
    });

    test('C115: Verify that user can specify which line will be imported from file and data will be imported correctly', async () => {
        const otherArg = '-l 10';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );

        const result = await importTest.importWithAuthToken(appInfo.apiToken.fullPermission);

        // Verify cli-kintone success message
        importTest.verifyCliKintoneSuccessMessage(result);

        // Verify imported data from kintone app
        const fieldNamesArray = await getFieldArray(importedCSVFile);
        const query = makeQueryToGetAppData();
        const expectedDataFile = filePaths.import_test.importDataWithLineParamExpected;
        await importTest.verifyImportedData(fieldNamesArray, expectedDataFile, query);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
