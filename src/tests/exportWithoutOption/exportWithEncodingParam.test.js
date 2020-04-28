import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export without --export option: Export data with encoding format (-e)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    let fieldNames = '';
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;

    test('Case 314: Verify that data can be exported to a file with utf-8 encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-8';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 314: Guest space - Verify that data can be exported to a file with utf-8 encoding', async () => {
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
        const encodingArg = '-e utf-8';

        const exportTest = new ExportTestCommon(
            guestSpaceApp,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg,
            guestSpaceArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('Case 315: Verify that data can be exported to a file with utf-16 encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-16';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataUtf16Expected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 316: Verify that data can be exported to a file with utf-16be-with-signature encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-16be-with-signature';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataUtf16beWithSignatureExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 317: Verify that data can be exported to a file with utf-16le-with-signature encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-16le-with-signature';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataUtf16leWithSignatureExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 318: Verify that data can be exported to a file with sjis encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e sjis';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataSjisExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 319: Verify that data can be exported to a file with euc-jp encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e euc-jp';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataJpEucExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 320: Verify that that default value "utf-8" will be used when using unsupported encoding type', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e invalid-encoding';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 321: API Token - Verify that data can be exported to a file with utf-8 encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-8';

        const exportTest = new ExportTestCommon(
            appInfo,
            undefined,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithAuthToken(appInfo.apiToken.fullPermission);

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
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
