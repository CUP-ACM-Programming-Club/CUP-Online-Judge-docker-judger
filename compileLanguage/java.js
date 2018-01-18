module.exports = {
    compile_method(name, fn, ...options) {
        let _name;
        if (typeof fn === "function") {
          //  console.log(name);
            _name = fn((" " + "Main.java").slice(1));
        }
        else {
            _name = "Main.java";
        }
        //const execFile = _name.substring(0, _name.indexOf("."));
        console.log(["/usr/bin/javac", ...options, "-encoding", "UTF-8", _name]);
        return ["/usr/bin/javac", ...options, "-encoding", "UTF-8", _name];
    },
    init(submit) {
        submit.setProgram("java");
        //submit.pushInputFiles("Main.java");
        submit.setCompileArgs(`-J-Xms64M`,`-J-Xmx512M`);
    }
};