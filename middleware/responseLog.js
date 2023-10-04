exports.responseLog = async(req, res, next) => {
    console.log('response code'.red.bold, res.statusCode);
    next()
}
