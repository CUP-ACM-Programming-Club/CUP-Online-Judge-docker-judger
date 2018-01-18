module.exports = {
    compile_method(name, fn, ...options) {
        let _name;
        if (typeof fn === "function") {
            _name = fn((" " + "Main.cs").slice(1));
        }
        else {
            _name = "Main.cs";
        }
        return ["/usr/bin/mcs", "-warn:0", _name,...options];
    },
    init(submit) {
        submit.setProgram("csharp");
        submit.pushInputFiles("Main.cs");
    }
};