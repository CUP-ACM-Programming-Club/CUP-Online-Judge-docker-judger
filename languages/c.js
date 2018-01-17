module.exports = (name, fn, version = 99, ...[options]) => {
    let _name;
    if (typeof fn === "function") {
        const _name = fn((" " + name).slice(1));
    }
    else {
        _name = name;
    }
    const execFile = _name.substring(0, _name.indexOf("."));
    return ["/usr/bin/gcc", "-o", execFile, _name, "-fno-asm", "-Wall",
        "-lm", "--static", `-std=c${version}`, "-DONLINE_JUDGE", ...options];
};