module.exports = (name,fn,...options)=>{
    return require("./c")(name,fn,89,...options);
};