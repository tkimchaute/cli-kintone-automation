import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import without --import option: Update current data with file by using * in front of field code (-f)', () => {
    const appInfo = apps.prohibitDuplicateApp;
    const adminUser = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData;
    const updateDataByNumberField = filePaths.import_test.updateDataUsingAsteriskSymbol;
    const updateDataExpectedPath = filePaths.import_test.updateDataUsingAsteriskSymbolExpected;
    const updateDataByMultiField = filePaths.import_test.updateDataUsingAsteriskSymbolMultiField;
    const updateDataMultiFieldExpectedPath =
        filePaths.import_test.updateDataUsingAsteriskSymbolMultiFieldExpected;
    const updateDataUsingAsteriskSymbolBlankValue =
        filePaths.import_test.updateDataUsingAsteriskSymbolBlankValue;
    const updateDataUsingAsteriskSymbolBlankExpected =
        filePaths.import_test.updateDataUsingAsteriskSymbolBlankExpected;

    test('C238: Verify that data will be updated correctly, the revision is increased by 1 after update', async () => {
        // C239, C248, C250 will be test at C238
        const updateTest = new ImportTestCommon(appInfo, adminUser, updateDataByNumberField, false);
        const result = await updateTest.importWithUserNamePassword();

        updateTest.verifyCliKintoneSuccessMessage(result);
        const fieldNamesArray = await getFieldArray(updateDataByNumberField);
        await updateTest.verifyImportedData(fieldNamesArray, updateDataExpectedPath);
    });

    test('C240: Verify that data will be updated when using * for multiple fields (e.g. *Text, *Number)', async () => {
        const updateTest = new ImportTestCommon(appInfo, adminUser, updateDataByMultiField, false);
        const result = await updateTest.importWithUserNamePassword();

        updateTest.verifyCliKintoneSuccessMessage(result);
        const fieldNamesArray = await getFieldArray(updateDataByMultiField);
        await updateTest.verifyImportedData(fieldNamesArray, updateDataMultiFieldExpectedPath);
    });

    test('C255: Verify the updated record is added as new record when leaving the value of *field is blank', async () => {
        const updateTest = new ImportTestCommon(
            appInfo,
            adminUser,
            updateDataUsingAsteriskSymbolBlankValue,
            false
        );
        const result = await updateTest.importWithUserNamePassword();

        updateTest.verifyCliKintoneSuccessMessage(result);
        const fieldNamesArray = await getFieldArray(updateDataByNumberField);
        await updateTest.verifyImportedData(
            fieldNamesArray,
            updateDataUsingAsteriskSymbolBlankExpected
        );
    });

    test('C258: Verify that data will be updated correctly using API Token', async () => {
        const updateTest = new ImportTestCommon(appInfo, adminUser, updateDataByNumberField, false);
        const result = await updateTest.importWithAuthToken(appInfo.apiToken.fullPermission);

        updateTest.verifyCliKintoneSuccessMessage(result);
        const fieldNamesArray = await getFieldArray(updateDataByNumberField);
        await updateTest.verifyImportedData(fieldNamesArray, updateDataExpectedPath);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, adminUser);
    });

    beforeEach(async () => {
        const importTest = new ImportTestCommon(appInfo, adminUser, importedCSVFile);
        await importTest.importWithUserNamePassword();
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, adminUser);
    });
});
