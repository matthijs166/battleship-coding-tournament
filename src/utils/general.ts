import logger from "./logger";

export function deepClone<T>(obj: T): T {

    logger.error("Deepclone not working correctly!!!");

    if (obj === null || typeof obj !== 'object') {
        return obj; // Return primitive types and null as-is
    }

    if (Array.isArray(obj)) {
        // Handle arrays
        return obj.map(item => deepClone(item)) as any;
    }

    // Handle objects
    const clonedObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }

    // Handle functions
    if (typeof obj === 'function') {
        const propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach(name => {
            const desc = Object.getOwnPropertyDescriptor(obj, name);
            if (desc) {
                Object.defineProperty(clonedObj, name, desc);
            }
        });
    }

    // Handel methods
    const propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(name => {
        const desc = Object.getOwnPropertyDescriptor(obj, name);
        if (desc) {
            Object.defineProperty(clonedObj, name, desc);
        }
    });


    return clonedObj as T;
}
