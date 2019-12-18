const validators = require( '../validators' );

exports.postingValidator = ( reqBody, next ) => {
    let commentData, options;
    const error = { status: 422, message: 'Invalid options in request' };

    if( !reqBody.data.operations[ 0 ][ 1 ] ) return next( error );// if request not has comment data return error
    commentData = validators.validate( reqBody.data.operations[ 0 ][ 1 ], validators.posting.simpleSchema, next ); // validate comment data
    if ( !commentData ) return;
    if( reqBody.data.operations[ 1 ] ) { // if request has comment options, validate it
        options = validators.validate( reqBody.data.operations[ 1 ][ 1 ], validators.posting.optionsSchema, next );
        if( !options ) return next( error );
    }
    return { commentData, options };
};
