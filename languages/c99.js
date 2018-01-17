module.exports = (name,fn,...options)=>{
    return require("./c")(name,fn,99,...options);
};