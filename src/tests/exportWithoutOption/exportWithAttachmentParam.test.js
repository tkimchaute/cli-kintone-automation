import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';
import { deleteFolderRecursive } from '../../utils/fileUtils';
import { makeQueryToGetAppData } from '../../common/helper';
import * as Path from 'path';

describe('Export without --export option: Export data with attachment (-b)', () => {
    const appInfo = apps.normalSpaceApp.appWithAttachment;
    const userCreds = users.admin;
    const userNoViewAttachmentCreds = users.userNoViewAttachmentFile;
    const preparedCSVFile = filePaths.export_test.exportDataPreparationWithAttachment;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    const expectedExportedDataFileWithAttachment =
        filePaths.export_test.exportCSVDataWithAttachmentExpected;
    const expectedExportedDataFileWithAttachmentAndFolder =
        process.platform === 'win32'
            ? filePaths.export_test.exportCSVDataWithAttachmentAndFolderWindowsExpected
            : filePaths.export_test.exportCSVDataWithAttachmentAndFolderExpected;
    const expectedExportedDataFileWithAttachmentAndFolderGuestSpace =
        process.platform === 'win32'
            ? filePaths.export_test.exportCSVDataWithAttachmentAndFolderWindowsGuestSpaceExpected
            : filePaths.export_test.exportCSVDataWithAttachmentAndFolderGuestSpaceExpected;
    const attachmentFolder = filePaths.attachmentFolder;
    let fieldNames = '';

    test('Case 339: Verify that the attachment will be displayed as text when not specifying -b param', async () => {
        const fieldArg = `-c ${fieldNames}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportedData(
            actualExportedDataFile,
            expectedExportedDataFileWithAttachment
        );
    });

    test('Case 340: Verify that the attachment will be displayed as text when specifying -b param', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ${attachmentFolder}`;
        const query = makeQueryToGetAppData();
        const queryArg = `-q ${query}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            queryArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportAttachmentFileData(attachmentFolder, fieldNames, query);
        await exportTest.verifyExportedData(
            actualExportedDataFile,
            expectedExportedDataFileWithAttachmentAndFolder
        );
    });

    test('Case 340 - Guest Space: Verify that the attachment will be displayed as text when specifying -b param', async () => {
        const guestSpaceApp = apps.guestSpaceApp.appWithAttachment;
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ${attachmentFolder}`;
        const query = makeQueryToGetAppData();
        const queryArg = `-q ${query}`;

        // Remove attachment folders in case they are not deleted completely in previous tests
        await deleteFolderRecursive(Path.join(filePaths.attachmentFolder, 'Attachment-0'));
        await deleteFolderRecursive(Path.join(filePaths.attachmentFolder, 'Attachment-1'));
        // delete data in guest space
        await deleteAllAppData(guestSpaceApp, userCreds);
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            preparedCSVFile,
            false,
            guestSpaceArg
        );
        await importTest.importWithAttachment(attachmentFolder);

        const exportTest = new ExportTestCommon(
            guestSpaceApp,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            guestSpaceArg,
            queryArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportAttachmentFileData(attachmentFolder, fieldNames, query);
        await exportTest.verifyExportedData(
            actualExportedDataFile,
            expectedExportedDataFileWithAttachmentAndFolderGuestSpace
        );

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('Case 341: Verify that if user specify non-existed folder, this folder will be created', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ./non-exist`;
        const query = makeQueryToGetAppData();
        const queryArg = `-q ${query}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            queryArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportAttachmentFileData('./non-exist/', fieldNames, query);
        await exportTest.verifyExportedData(
            actualExportedDataFile,
            expectedExportedDataFileWithAttachmentAndFolder
        );
    });

    test('Case 344-345-346: Verify the case with attachment are text files, image files or exe files (doc, xls, csv, png, jpg, exe)', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ${attachmentFolder}`;
        const query = makeQueryToGetAppData();
        const queryArg = `-q ${query}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            queryArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportAttachmentFileData(attachmentFolder, fieldNames, query);
        await exportTest.verifyExportedData(
            actualExportedDataFile,
            expectedExportedDataFileWithAttachmentAndFolder
        );
    });

    test('Case 347: Verify that the attachment will NOT be downloaded if user does NOT have proper permissions', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ${attachmentFolder}`;
        const query = makeQueryToGetAppData();
        const queryArg = `-q ${query}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userNoViewAttachmentCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            queryArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataWithoutViewAttachmentExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 348: In combination with params -o -e -q, verify that the attachment will be downloaded when specifying -b', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ${attachmentFolder}`;
        const outputArg = `-o csv`;
        const query = makeQueryToGetAppData();
        const queryArg = `-q ${query}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            queryArg,
            outputArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportAttachmentFileData(attachmentFolder, fieldNames, query);
        await exportTest.verifyExportedData(
            actualExportedDataFile,
            expectedExportedDataFileWithAttachmentAndFolder
        );
    });

    beforeAll(async () => {
        // Remove attachment folders in case they are not deleted completely in previous tests
        const nonexistentFolderPath = process.cwd() + '/non-exist';
        await deleteFolderRecursive(nonexistentFolderPath);
        await deleteFolderRecursive(Path.join(filePaths.attachmentFolder, 'Attachment-0'));
        await deleteFolderRecursive(Path.join(filePaths.attachmentFolder, 'Attachment-1'));

        // Remove data if exist and prepare new data
        await deleteAllAppData(appInfo, userCreds);
        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithAttachment(attachmentFolder);

        // Get field names and remove some field names which their values are incremental ids
        fieldNames = await getFieldArray(preparedCSVFile);
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
