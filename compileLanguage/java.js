module.exports = {
    //TODO:complete java options.
    compile_method(name, fn, ...options) {
        let _name;
        if (typeof fn === "function") {
            _name = fn((" " + name).slice(1));
        }
        else {
            _name = name;
        }
        //const execFile = _name.substring(0, _name.indexOf("."));
        return ["/usr/bin/javac", ...options, "-encoding", "UTF-8", _name];
    },
    init(submit) {
        submit.setCompileArgs(`-J-Xmx${this.memory_limit + this.memory_limit_reserve}M`,
            `-J-XX:MaxMetaspaceSize=${this.memory_limit + this.memory_limit_reserve}`);
    }
};