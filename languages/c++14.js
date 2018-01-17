module.exports = (name,fn,...options)=>{
    return require("./c++")(name,fn,14,...options);
};