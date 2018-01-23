const SANDBOX_DOCKER_IMAGE = "sandbox:v2";
const SANDBOX_UID = 1111;
const SANDBOX_GID = 1111;
const SANDBOX_PATH = '/sandbox';
const SANDBOX_EXEC_PATH = '/usr/bin/sandbox';
const SANDBOX_RESULT_PATH = '/sandbox/result.txt';
const SANDBOX_COMPILE_PATH = '/sandbox/compile';
let Promise = require('bluebird');
let Docker = require('dockerode');
let TarStream = require('tar-stream');
let path = require('path');
let fs = Promise.promisifyAll(require('fs'));
let docker = Promise.promisifyAll(new Docker());

async function streamToBuffer(stream) {
	return await new Promise((resolve, reject) => {
		let buffers = [];
		stream.on('data', buffer => {
			buffers.push(buffer);
		});

		stream.on('end', () => {
			let buffer = Buffer.concat(buffers);
			resolve(buffer);
		});

		stream.on('error', reject);
	});
}

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

function socketMessage(options, status, time, memory, pass_point, compile_msg = "") {
	options.emit("processing", {
		status: status,
		time: time,
		memory: memory,
		pass_point: pass_point,
		test_run: test_run,
		compile_msg: compile_msg
	});
}

async function tar(files) {
	let pack = TarStream.pack();
	for (let file of files) {
		pack.entry(file, file.data);
	}
	pack.finalize();
	return await streamToBuffer(pack);
}

function parseResult(result) {
	let a = result.split('\n');
	return {
		status: a[0],
		debug_info: a[1],
		time_usage: parseInt(a[2]),
		memory_usage: parseInt(a[3]), /*
        debug: a[4]
        */
		runtime_flag: parseInt(a[4])
	};
}

async function untar(data) {
	return await new Promise((resolve, reject) => {
		let extract = TarStream.extract(), res = [];
		extract.on('entry', async (header, stream, callback) => {
			header.data = await streamToBuffer(stream);
			res.push(header);
			callback();
		});

		extract.write(data);
		extract.end();

		extract.on('finish', () => {
			resolve(res);
		});
		extract.on('error', reject);
	});
}

module.exports = async options => {
	options = Object.assign({
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
		compile_args: []
	}, options);

//  let container;

	try {
		// Check if the docker image exists
		let image = Promise.promisifyAll(docker.getImage(SANDBOX_DOCKER_IMAGE));

		try {
			await image.inspectAsync();
		} catch (e) {
			// Image not exists
			await new Promise((resolve, reject) => {
				// Pull the image
				docker.pull(SANDBOX_DOCKER_IMAGE, async (err, res) => {
					if (err) reject(err);

					// Check if the image is pulled
					while (1) {
						try {
							await image.inspectAsync();
							break;
						} catch (e) {
							// Delay 50ms
							await Promise.delay(50);
						}
					}

					resolve();
				});
			});
		}
		// Create the container
		let container = await docker.createContainerAsync({
			Image: SANDBOX_DOCKER_IMAGE,
			HostConfig: {
				NetworkMode: 'none'
			}
		});
		Promise.promisifyAll(container);
		let pipeStream = await container.attachAsync({
			stream: true,
			stdout: true,
			stderr: true
		});
		pipeStream.pipe(process.stdout);

		async function getFile(path) {
			for (let i = 0; i < 10; i++) {
				try {
					let stream = await container.getArchiveAsync({
						path: path
					});

					// Convert stream to buffer
					let buffer = await streamToBuffer(stream);

					let tar = await untar(buffer);

					return tar[0];
				} catch (e) {
					//continue;
				}
			}
			return null;
		}

		// Start the container
		await container.startAsync();
		// Put the files via tar
		for (let i in options.file_stdin) {
			options.input_files.push({
				name: path.basename(options.file_stdin[i]),
				mode: parseInt('755', 8),
				data: await fs.readFileAsync(options.file_stdin[i])
			})
		}
		/*
		if (~path.basename(options.program).indexOf(".")) {
			options.input_files.push({
				name: path.basename(options.program),
				mode: parseInt('755', 8),
				data: await fs.readFileAsync(options.program)
			});
		}
		*/

		for (let file of options.input_files) {
			file.uid = SANDBOX_UID;
			file.gid = SANDBOX_GID;
		}

		await container.putArchiveAsync(await tar(options.input_files), {
			path: SANDBOX_PATH
		});


		function getSandboxedPath(file) {
			if (file.length)
				return path.join(SANDBOX_PATH, path.basename(file));
			else
				return "";
		}

		if (options.file_stdin.length) {
			for (let i in options.file_stdin) {
				options.file_stdin[i] = getSandboxedPath(options.file_stdin[i]);
			}
			if (options.file_stdout.length) {
				for (let i in options.file_stdout) {        // Exec the program with sandbox
					options.file_stdout[i] = getSandboxedPath(options.file_stdout[i]);
				}
			}
			else if (options.file_stdin.length) {
				for (let i in options.file_stdin) {
					options.file_stdout[i] = getSandboxedPath(flipSuffix(options.file_stdin[i]) + ".out");
				}
			}
			if (options.file_stderr.length) {
				for (let i in options.file_stderr) {
					options.file_stderr[i] = getSandboxedPath(options.file_stderr[i]);
				}
			}
			else if (options.file_stdin.length) {
				for (let i in options.file_stdin) {
					options.file_stderr[i] = getSandboxedPath(flipSuffix(options.file_stdin[i]) + ".err");
				}
			}
		}
		else {
			options.file_stdin = [];
			options.file_stdin.push("");
			options.file_stdout.push("/sandbox/data.out");
			options.file_stderr.push("/sandbox/data.err");
		}
		let compile_out, compile_error;
		// compile
		if (options.compile_method) {
			socketMessage(options, 2, 0, 0, 0);
			let compile_arg = options.compile_method(options.program, getSandboxedPath, ...options.compile_args);
			let cmd = [SANDBOX_COMPILE_PATH, compile_arg.join(" ")];
			let compile = await container.execAsync({
				Cmd: cmd
			});
			console.log(cmd);
			Promise.promisifyAll(compile);
			await compile.startAsync();
			let compileDaemon;
			do {
				compileDaemon = await compile.inspectAsync();
				await Promise.delay(50);
			} while (compileDaemon.Running);

			compile_out = await (async () => {
				let result;
				let tmp = await getFile(SANDBOX_COMPILE_PATH + ".out");
				//console.log(SANDBOX_COMPILE_PATH + ".out");
				if (tmp && tmp.data) result = tmp.data.toString();
				return result;
			})();
			compile_error = await (async () => {
				let result;
				let tmp = await getFile(SANDBOX_COMPILE_PATH + ".err");
				if (tmp && tmp.data) result = tmp.data.toString();
				return result;
			})();
			if (compile_error && compile_error.length &&
				~compile_error.indexOf("error")) {
				container.removeAsync({
					force: true
				}).then(() => {
				}).catch(() => {
				});
				return {
					compile_out: compile_out,
					compile_error: compile_error,
					status: "compile error"
				}
			}
		}

		let output_files = {};
		let output_errors = {};
		let _result = {};
		socketMessage(options, 3, 0, 0, 0);
		let pass_point = 0;
		let stop_code = 0;
		for (let i in options.file_stdin) {
			let cmd = [
				SANDBOX_EXEC_PATH,
				getSandboxedPath(flipSuffix(options.program)),
				options.file_stdin[i],
				options.file_stdout[i],
				options.file_stderr[i],
				options.time_limit.toString(),
				options.time_limit_reserve.toString(),
				options.memory_limit.toString(),
				options.memory_limit_reserve.toString(),
				parseInt(options.large_stack + 0).toString(),
				options.output_limit.toString(),
				options.process_limit.toString(),
				SANDBOX_RESULT_PATH
			];
			console.log(cmd);
			let exec = await container.execAsync({
				Cmd: cmd,
				AttachStdout: true,
				AttachStderr: true
			});
			Promise.promisifyAll(exec);
			await exec.startAsync();
			let dataExec;
			do {
				dataExec = await exec.inspectAsync();
				await Promise.delay(50);
			} while (dataExec.Running);
			let result;
			while (!result) {
				let tmp = await getFile(SANDBOX_RESULT_PATH);
				if (tmp && tmp.data) result = tmp.data.toString();
				await Promise.delay(50);
			}
			_result[flipSuffix(options.file_stdin[i])] = (result = parseResult(result.toString()));
			let output_file, loop_time = 0;
			const total_time = options.time_limit + options.time_limit_reserve;
			//console.log(total_time);
			output_file = await (async () => {
				//console.log(`looping:${loop_time}`);
				let output_file;
				let tmp = await getFile(options.file_stdout[i]);
				if (tmp && tmp.data) output_file = tmp.data.toString();
				return output_file;
			})();
			if (loop_time > total_time * 4) {
				break;
			}
			let output_error;
			loop_time = 0;
			output_error = await (async () => {
				let output_error;
				//console.log(`looping:${loop_time}`);
				let tmp = await getFile(options.file_stderr[i]);
				if (tmp && tmp.data) output_error = tmp.data.toString();
				return output_error
			})();
			let _output;
			output_files[(_output = path.basename(flipSuffix(options.file_stdout[i])))] = output_file;
			output_errors[path.basename(flipSuffix(options.file_stderr[i]))] = output_error;
			const compareDiff = new Promise((resolve, reject) => {
				let status_code;
				if ((status_code = options.compare_fn(ans[_output], output_file)) - 2) {
					reject(status_code);
				}
				resolve(status_code);
			}).then(() => {
			}).catch(code => {
				stop_code = 1;
				let status_code;
				if (code) {
					status_code = 5;
				}
				else {
					status_code = 6;
				}
				let time_usage = 0, memory_usage = 0;
				for (let i in _result) {
					time_usage = Math.max(_result[i].time_usage, time_usage);
					memory_usage = Math.max(_result[i].memory_usage, memory_usage);
				}
				socketMessage(options, status_code, time_usage, memory_usage, pass_point);
			});
			if (stop_code || result.runtime_flag) {
				container.removeAsync({
					force: true
				}).then(() => {
				}).catch(() => {
				});
				return {
					compile_out: compile_out,
					compile_error: compile_error,
					result: _result,
					output_files: output_files,
					output_errors: output_errors
				}
			}
			++pass_point;
		}
		let time_usage = 0,memory_usage = 0;
		for(let i in _result){
			time_usage = Math.max(_result[i].time_usage,time_usage);
			memory_usage = Math.max(_result[i].memory_usage,memory_usage);
		}
		socketMessage(options,4,time_usage,memory_usage,pass_point);
		container.removeAsync({
			force: true
		}).then(() => {
		}).catch(() => {
		});

		return {
			status: "OK",
			compile_out: compile_out,
			compile_error: compile_error,
			result: _result,
			output_files: output_files,
			output_errors: output_errors
		}
	} catch (e) {
		console.log(e);
		container.removeAsync({
			force: true
		}).then(() => {
		}).catch(() => {
		});
		throw e;
	}
};
