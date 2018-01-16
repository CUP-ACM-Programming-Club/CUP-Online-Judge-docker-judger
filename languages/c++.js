module.exports = (name, fn, version = 11, ...[options]) => {
	let _name;
	if (typeof fn === "function") {
		_name = fn((" " + name).slice(1));
	}
	else {
		_name = name;
	}
	const execFile = _name.substring(0, _name.indexOf("."));
	return {
		arg: ["/usr/bin/g++", "-o", execFile, _name, "-fno-asm", "-Wall",
			"-lm", "--static", `-std=c++${version}`, "-DONLINE_JUDGE", ...options],
		file: ["Main.cpp"]
	};
};