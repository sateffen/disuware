const {spawn} = require('child_process');

const processResults = {
    stdOut: [],
    stdErr: [],
    exitCode: -1,
    exitError: null,
};

beforeAll((done) => {
    const process = spawn('node', ['src/bin/disuware.js', 'run', 'examples/consoledicts/config.json']);

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

test('The process should exit printing 2 lines', () => {
    expect(processResults.stdOut.length).toBe(2);
});

test('The process should exit printing the expected lines', () => {
    const stdOut = processResults.stdOut.map((buffer) => buffer.toString()).join('').split('\n');

    expect(stdOut[0]).toBe('Module 1 dict says old dict');
    expect(stdOut[1]).toBe('Module 2 dict says new dict');
});
