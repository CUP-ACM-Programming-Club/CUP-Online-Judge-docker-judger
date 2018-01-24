const runner = require("./runner");
const path = require("path");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const eventEmitter = require("events").EventEmitter;

function flipSuffix(name, change = 0) {
    let _name = name;
    if (~name.indexOf(".")) {
        return _name.substring(0, _name.indexOf("."));
    }
    else {
        if (change) {
            return "data";
        }
        else {
            return name;
        }
    }
}

async function fileToBuffer(file_name) {
    return {
        name: path.basename(file_name),
        mode: parseInt("755", 8),
        data: await fs.readFileAsync(file_name)
    }
}

class RunnerPackage extends eventEmitter {
    constructor() {
        super();
        this.program = "";
        this.file_stdin = [];
        this.file_stdout = [];
        this.file_stderr = [];
        this.time_limit = 1;
        this.time_limit_reserve = 1;
        this.memory_limit = 32;
        this.memory_limit_reserve = 64;
        this.large_stack = 0;
        this.output_limit = 0;
        this.process_limit = 0;
        this.input_files = [];
        this.output_files = [];
        this.compile_method = undefined;
        this.compile_args = [];
        this.compare_fn = undefined;
        this.answer_file = [];
    }

    setProgram(program) {
        this.program = program
    }

    setFileStdin() {
        this.file_stdin = arguments;
    }

    pushFileStdin() {
        this.file_stdin.push(...arguments);
    }

    deleteFileStdin(file_name) {
        let pos = this.file_stdin.indexOf(file_name);
        if (~pos) {
            this.file_stdin.splice(pos, 1);
        }
    }

    setFileStdout() {
        this.file_stdout = arguments;
    }

    setFileStderr() {
        this.file_stderr = arguments;
    }

    setTimeLimit(time_limit) {
        this.time_limit = parseFloat(time_limit);
    }

    setTimeLimitReserve(time_limit_reserve) {
        this.time_limit_reserve = parseFloat(time_limit_reserve);
    }

    setMemoryLimit(memory_limit) {
        this.memory_limit = parseFloat(memory_limit);
    }

    setMemoryLimitReverse(memory_limit_reserve) {
        this.memory_limit_reserve = parseFloat(memory_limit_reserve);
    }

    setLargeStack(stack) {
        this.large_stack = parseInt(stack);
    }

    setOutputLimit(output_limit) {
        this.output_limit = parseInt(output_limit);
    }

    setProcessLimit(process_limit) {
        this.process_limit = parseInt(process_limit);
    }

    async pushInputFiles(...file_name) {
        for (let i in file_name) {
            this.input_files.push({
                name: path.basename(file_name[i]),
                mode: parseInt("755", 8),
                data: await fs.readFileAsync(file_name[i])
            });
        }
    }

    async pushInputRawFiles(...rawFile) {
        for (let i in rawFile) {
            this.input_files.push({
                name: rawFile[i].name,
                mode: parseInt("755", 8),
                data: rawFile[i].data
            })
        }
    }

    async pushAnswerFiles(...file_name) {
        for (let i in file_name) {
            this.answer_file[path.basename(flipSuffix(file_name[i]))] =
                await fs.readFileAsync(file_name[i]);
        }
    }

    async pushOutputFiles(...file_name) {
        for (let i in file_name) {
            this.output_files.push({
                name: path.basename(file_name[i]),
                mode: parseInt("755", 8),
                data: await fs.readFileAsync(file_name[i])
            })
        }
    }

    setCompileMethod(fn) {
        if (typeof fn("Main.cpp") !== "undefined") {
            this.compile_method = fn;
        }
    }

    async setLanguage(language, ...file) {
        this.setCompileMethod(require(`./compileLanguage/${language}`).compile_method);
        require(`./compileLanguage/${language}`).init(this);
        for (let i in file) {
            this.input_files.push(await fileToBuffer(file[i]));
        }
    }

    setCompileArgs(...args) {
        this.compile_args = args;
    }

    setCompareFunction(fn) {
        if (typeof fn === "function") {
            this.compare_fn = fn;
        }
    }
}


function createSubmit() {
    return new RunnerPackage();
}


module.exports = {runner, createSubmit, fileToBuffer};