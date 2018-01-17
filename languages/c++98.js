module.exports = (name,fn,...options)=>{
    return require("./c++")(name,fn,98,...options);
};