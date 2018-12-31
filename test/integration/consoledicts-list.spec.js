const {spawn} = require('child_process');

describe('Consoledicts list', () => {
    const processResults = {
        stdOut: [],
        stdErr: [],
        exitCode: -1,
        exitError: null,
    };

    beforeAll((done) => {
        const process = spawn('node', ['src/bin/disuware.js', 'list', 'examples/consoledicts/config.json']);

        process.stdout.on('data', (data) => processResults.stdOut.push(data));
        process.stderr.on('data', (data) => processResults.stdErr.push(data));
        process.on('error', (error) => {
            processResults.exitError = error;
            done();
        });
        process.on('close', (code) => {
            processResults.exitCode = code;
            done();
        });
    });

    test('The process should execute without errors', () => {
        expect(processResults.exitError).toBeNull();
    });

    test('The process should exit with exitCode 0', () => {
        expect(processResults.exitCode).toBe(0);
    });

    test('The process should exit with an empty stdErr', () => {
        expect(processResults.stdErr.length).toBe(0);
    });

    test('The process should exit printing 4 lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut.pop()).toBe('');
        expect(stdOut.length).toBe(4);
    });

    test('The process should exit printing the expected lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut[0]).toBe('- module1@1.0.0');
        expect(stdOut[1]).toBe('- module2@1.0.0');
        expect(stdOut[2]).toBe('- dict@2.0.0');
        expect(stdOut[3]).toBe('- dict@1.0.0');
    });
});

describe('Consoledicts list --linked', () => {
    const processResults = {
        stdOut: [],
        stdErr: [],
        exitCode: -1,
        exitError: null,
    };

    beforeAll((done) => {
        const process = spawn('node', ['src/bin/disuware.js', 'list', '--linked', 'examples/consoledicts/config.json']);

        process.stdout.on('data', (data) => processResults.stdOut.push(data));
        process.stderr.on('data', (data) => processResults.stdErr.push(data));
        process.on('error', (error) => {
            processResults.exitError = error;
            done();
        });
        process.on('close', (code) => {
            processResults.exitCode = code;
            done();
        });
    });

    test('The process should execute without errors', () => {
        expect(processResults.exitError).toBeNull();
    });

    test('The process should exit with exitCode 0', () => {
        expect(processResults.exitCode).toBe(0);
    });

    test('The process should exit with an empty stdErr', () => {
        expect(processResults.stdErr.length).toBe(0);
    });

    test('The process should exit printing 4 lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut.pop()).toBe('');
        expect(stdOut.length).toBe(4);
    });

    test('The process should exit printing the expected lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut[0]).toBe('- dict@2.0.0');
        expect(stdOut[1]).toBe('- dict@1.0.0');
        expect(stdOut[2]).toBe('- module1@1.0.0');
        expect(stdOut[3]).toBe('- module2@1.0.0');
    });
});

describe('Consoledicts list --dependencies', () => {
    const processResults = {
        stdOut: [],
        stdErr: [],
        exitCode: -1,
        exitError: null,
    };

    beforeAll((done) => {
        const process = spawn('node', ['src/bin/disuware.js', 'list', '--dependencies', 'examples/consoledicts/config.json']);

        process.stdout.on('data', (data) => processResults.stdOut.push(data));
        process.stderr.on('data', (data) => processResults.stdErr.push(data));
        process.on('error', (error) => {
            processResults.exitError = error;
            done();
        });
        process.on('close', (code) => {
            processResults.exitCode = code;
            done();
        });
    });

    test('The process should execute without errors', () => {
        expect(processResults.exitError).toBeNull();
    });

    test('The process should exit with exitCode 0', () => {
        expect(processResults.exitCode).toBe(0);
    });

    test('The process should exit with an empty stdErr', () => {
        expect(processResults.stdErr.length).toBe(0);
    });

    test('The process should exit printing 6 lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut.pop()).toBe('');
        expect(stdOut.length).toBe(6);
    });

    test('The process should exit printing the expected lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut[0]).toBe('- module1@1.0.0');
        expect(stdOut[1]).toBe('|- dict@~1.0.0');
        expect(stdOut[2]).toBe('- module2@1.0.0');
        expect(stdOut[3]).toBe('|- dict@~2.0.0');
        expect(stdOut[4]).toBe('- dict@2.0.0');
        expect(stdOut[5]).toBe('- dict@1.0.0');
    });
});
describe('Consoledicts list --dependencies --linked', () => {
    const processResults = {
        stdOut: [],
        stdErr: [],
        exitCode: -1,
        exitError: null,
    };

    beforeAll((done) => {
        const process = spawn('node', ['src/bin/disuware.js', 'list', '--dependencies', '--linked', 'examples/consoledicts/config.json']);

        process.stdout.on('data', (data) => processResults.stdOut.push(data));
        process.stderr.on('data', (data) => processResults.stdErr.push(data));
        process.on('error', (error) => {
            processResults.exitError = error;
            done();
        });
        process.on('close', (code) => {
            processResults.exitCode = code;
            done();
        });
    });

    test('The process should execute without errors', () => {
        expect(processResults.exitError).toBeNull();
    });

    test('The process should exit with exitCode 0', () => {
        expect(processResults.exitCode).toBe(0);
    });

    test('The process should exit with an empty stdErr', () => {
        expect(processResults.stdErr.length).toBe(0);
    });

    test('The process should exit printing 6 lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut.pop()).toBe('');
        expect(stdOut.length).toBe(6);
    });

    test('The process should exit printing the expected lines', () => {
        const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

        expect(stdOut[0]).toBe('- dict@2.0.0');
        expect(stdOut[1]).toBe('- dict@1.0.0');
        expect(stdOut[2]).toBe('- module1@1.0.0');
        expect(stdOut[3]).toBe('|- dict@~1.0.0');
        expect(stdOut[4]).toBe('- module2@1.0.0');
        expect(stdOut[5]).toBe('|- dict@~2.0.0');
    });
});
