﻿String.prototype.format = function (...args) {
    let result = this;
    
    if(Array.isArray(args)){
        args.forEach(str => {
            result = result.replace("{}", str);
        });
    }
    else{
        result = result.replace("{}", args);
    }
    
    
    return result;
}

export {}