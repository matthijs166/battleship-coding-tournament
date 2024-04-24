import logger from "./logger";

// Deep clone a class instance
export function deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // if it is an array then clone each element
    if (Array.isArray(obj)){
        return obj.map((el) => deepClone(el));
    }

    // if it is a number or string then return it
    if (typeof obj === 'number' || typeof obj === 'string'){
        return obj;
    }

    // if it is a function then return it
    if (typeof obj === 'function'){
        return obj;
    }

    // if it is a class instance then clone it
    if (obj.constructor.name !== 'Object'){
        let clone =  Object.create(Object.getPrototypeOf(obj));

        // set this reference to the new object
        Object.setPrototypeOf(clone, obj);

        // clone each property
        for (let key in obj){
            clone[key] = deepClone(obj[key]);
        }

        return clone;
    }


    return obj
}


