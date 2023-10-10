const  advancedResults = (model, populate) => async (req, res, next) => {
    //console.log('params'.red, req.params)
    let query;

    //Copy query
    let reqQuery = { ...req.query }

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];


    //Important: Loop over remove fields and delete from request query
    removeFields.forEach(param => delete reqQuery[param]);

    //create string query
    let queryStr = JSON.stringify(reqQuery)

    //Create operators $le, $gt...
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    //Find resources
    query = model.find(JSON.parse(queryStr));

    //Select fields if included
    if (req.query.select){
        const fields = req.query.select.split(',').join(' ')
        console.log(fields)
        query = query.select(fields)
    }

    //Sort fields if included
    if (req.query.sort){
        const sorts = req.query.select.split(',').join(' ')
        console.log(sorts)
        query = query.sort(sorts)
    } else {
        query = query.sort('-averageCost'); //by default descendant averageCost (-)
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    query.skip(startIndex).limit(limit);
    const endIndex = page * limit;
    const total = await model.countDocuments();

    if (populate){
        query = query.populate(populate)
    }
    
    //execute query
    const results = await query    

    //pagination result
    const pagination = {};

    
    if (endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        total: total, 
        pagination, 
        data: results
    }
    
    next();

}

module.exports = advancedResults;