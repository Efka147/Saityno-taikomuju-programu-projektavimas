import { isValidObjectId } from 'mongoose';

export const isValidParam = (param: any, expectedType: 'string' | 'number' | 'objID') => {
    if (
        expectedType === 'string'
            ? param && typeof param === 'string' && param.length >= 2
            : expectedType === 'objID'
            ? param && isValidObjectId(param)
            : param !== undefined && param !== null && typeof param === 'number'
    )
        return true;
    return false;
};
