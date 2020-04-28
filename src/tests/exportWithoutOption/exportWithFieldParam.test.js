import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export without --export option: Export data with field (-c)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    let fieldNames = '';

    test('Case 332: Verify that only data of fields listed in -c parameter are returned', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataWithFieldParamExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 332: Guest space - Verify that only data of fields listed in -c parameter are returned', async () => {
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

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataWithFieldParamExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('Case 335: In the combination with -e, Verify that only data of fields listed in -c parameter are returned', async () => {
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

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataWithFieldParamExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 336: In the combination with -e -q, Verify that only data of fields listed in -c parameter are returned', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-8';
        const queryArg = '-q "Number>1002"';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg,
            queryArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataWithFieldEncodingQueryParamExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 337: In the combination with -e -q -g, in which value of -g is 0, Verify that only data of fields listed in -c parameter are returned', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-8';
        const queryArg = '-q "Number>1002"';
        const guestSpaceArg = '-g 0';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg,
            queryArg,
            guestSpaceArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataWithFieldEncodingQueryParamExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);

        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithUserNamePassword();

        // get field names (Link,Text_area,Date,Time,Date_and_time,Multi_choice) for exporting data
        fieldNames = await getFieldArray(preparedCSVFile);
        fieldNames = fieldNames.slice(1, 7);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
