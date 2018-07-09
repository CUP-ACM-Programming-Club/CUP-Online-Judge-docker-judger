module.exports ={
    compile_method(name, fn, ...options){
        if (typeof fn === "function") {
            const _name = fn((" " + name).slice(1));
            return ["/usr/bin/fpc", _name, "-Cs32000000", "-Sh", "-O2", "-Co", "-Ct", "-Ci", ...options]
        }
    },
    init(submit)
    {
        //submit.setProgram("Main.pas");
    }
};