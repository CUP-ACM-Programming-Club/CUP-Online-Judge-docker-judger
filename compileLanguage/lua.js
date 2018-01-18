module.exports = {
    compile_method(name, fn, ...options) {
        let _name;
        if (typeof fn === "function") {
            _name = fn((" " + name).slice(1));
        }
        else {
            _name = name;
        }
        const execFile = _name.substring(0, _name.indexOf("."));
        return ["/sandbox/lua.sh", ...options]
    },
    init(submit){
        submit.setProgram("lua");
        submit.pushInputFiles("Main.lua");
    }
};