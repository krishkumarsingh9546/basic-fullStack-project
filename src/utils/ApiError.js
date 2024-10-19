class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        error = [],
        status = ""
        
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.error = this.errors

        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
     }
}


export {ApiError}