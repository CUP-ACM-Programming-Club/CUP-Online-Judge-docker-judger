module.exports = {
    compile_method(name, fn, ...options){
        return require("./c++").compile_method(name, fn, 98, ...options);
    },
    init(submit){
        require("./c++").init(submit);
    }
};