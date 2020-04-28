import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export with --export option: Export data with encoding format (-e)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    let fieldNames = '';

    test('Case 154: Verify that data can be exported to a file with utf-8 encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-8';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 154: Guest space - Verify that data can be exported to a file with utf-8 encoding', async () => {
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
            true,
            fieldArg,
            encodingArg,
            guestSpaceArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
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
