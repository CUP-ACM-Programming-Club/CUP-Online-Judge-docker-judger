module.exports ={
    compile_method(name, fn, ...options){
        let _name;
        if (typeof fn === "function") {
            _name = fn((" " + name).slice(1));
        }
        else {
            _name = name;
        }
        const execFile = _name.substring(0, _name.indexOf("."));
        return ["/usr/bin/clang", "-o", execFile, _name, "-fno-asm", "-Wall",
            "-lm", "-pipe", `-std=c99`, "-DONLINE_JUDGE", ...options];
    },
    init(submit){
        submit.setProgram("Main.c");
        submit.setCompileArgs("-O2");
    }
};