import { executeCommand, getCliKintoneCommand } from '../../common/helper';

describe('Export without --export option: not providing enough parameter', () => {
    test('Case 352: Verify that usage guide will be returned when not providing any parameter', async () => {
        const command = getCliKintoneCommand();

        const result = await executeCommand(command, true);
        expect(result).toContain('Usage:');
    });

    test('Case 353: Verify that usage guide will be returned when providing unsupported parameter', async () => {
        const command = getCliKintoneCommand() + ' -h';

        const result = await executeCommand(command, true);
        expect(result).toContain('Usage:');
    });
});
