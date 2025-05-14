//Error handling middleware
export const errorHandler = (err,req,res,next) => {
    //Default error status and message
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Something went wrong';

    //Handle Mongoose validation errors
    if(err.name === 'ValidationError'){
        statusCode = 400;
        const error = Object.values(err.errors).map(error => error.message);
        message = error.join(', ');
    }

    //Handle Mongoose duplicate Key errors
    if(err.code === 11000){
        statusCode = 400;
        message = 'Duplicate field value entered';
    }

    //Handle Mongoose cast errors (invalid objectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

      // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
}