module.exports = (name, fn, ...[options]) => {
	if (typeof fn === "function") {
		const _name = fn((" " + name).slice(1));
		return {
			arg:["/usr/bin/fpc", _name,"-Cs32000000","-Sh", "-O2", "-Co", "-Ct", "-Ci", ...options],
			file:["Main.pas"]
		};
	}
};