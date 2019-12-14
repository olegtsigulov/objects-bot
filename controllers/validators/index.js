module.exports = {
    posting: require( './postingValidator' ),
    object: require( './objectValidator' ),
    appendObject: require( './appendObjectValidator' ),
    validate: ( data, schema, next ) => {
        const result = schema.validate( data, { abortEarly: false } );

        if( result.error ) {
            const error = { status: 422, message: result.error.message };

            return next( error );
        }
        return result.value ;

    }
};
