const runner = require("./runner");
const path = require("path");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));

async function fileToBuffer(file_name) {
    return {
        name: path.basename(file_name),
        mode: parseInt("755", 8),
        data: await fs.readFileAsync(file_name)
    }
}

function createSubmit() {
    return {
        program: '',
        file_stdin: [],
        file_stdout: [],
        file_stderr: [],
        time_limit: 0,
        time_limit_reserve: 1,
        memory_limit: 0,
        memory_limit_reserve: 32 * 1024,
        large_stack: 0,
        output_limit: 0,
        process_limit: 0,
        input_files: [],
        output_files: [],
        compile_method: undefined,
        setProgram(program) {
            this.program = program
        },
        setFileStdin() {
            this.file_stdin = arguments;
        },
        setFileStdout() {
            this.file_stdout = arguments;
        },
        setFileStderr() {
            this.file_stderr = arguments;
        },
        setTimeLimit(time_limit) {
            this.time_limit = parseFloat(time_limit);
        },
        setTimeLimitReserve(time_limit_reserve) {
            this.time_limit_reserve = parseFloat(time_limit_reserve);
        },
        setMemoryLimit(memory_limit) {
            this.memory_limit = parseFloat(memory_limit);
        },
        setMemoryLimitReverse(memory_limit_reserve) {
            this.memory_limit_reserve = parseFloat(memory_limit_reserve);
        },
        setLargeStack(stack) {
            this.large_stack = parseInt(stack);
        },
        setOutputLimit(output_limit) {
            this.output_limit = parseInt(output_limit);
        },
        setProcessLimit(process_limit) {
            this.process_limit = parseInt(process_limit);
        },
        async pushInputFiles(file_name) {
            this.input_files.push({
                name: path.basename(file_name),
                mode: parseInt("755", 8),
                data: await fs.readFileAsync(file_name)
            });
        },
        async pushOutputFiles(file_name) {
            this.output_files.push({
                name: path.basename(file_name),
                mode: parseInt("755", 8),
                data: await fs.readFileAsync(file_name)
            })
        },
        setCompileMethod(fn) {
            if (typeof fn === "function") {
                this.compile_method = fn;
            }
        },
        setLanguage(language, ...[file]) {
            this.setCompileMethod(require(`./languages/${language}`));
            this.setProgram(language.toString());
            for (let i in file) {
                this.input_files.push(fileToBuffer(file[i]));
            }
        }
    };
}


module.exports = {runner, createSubmit, fileToBuffer};