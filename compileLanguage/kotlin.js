module.exports = {
    compile_method(name, fn, ...options) {
        let _name;
        if (typeof fn === "function") {
            //  console.log(name);
            _name = fn((" " + "Main.kt").slice(1));
        }
        else {
            _name = "Main.kt";
        }
        const execFile = _name.substring(0, _name.indexOf("."));
        return ["/usr/bin/kotlinc",_name, "-include-runtime", "-d",  execFile + ".jar", ...options]
    },
    init(submit) {
        submit.setProgram("kotlin");
        submit.pushInputFiles("Main.kt");
    }
};