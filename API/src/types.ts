import { Role } from './constants';

export type EndpointAccessType = {
    POST: { [key in Role]: boolean };
    DELETE: { [key in Role]: boolean };
    GET: { [key in Role]: boolean };
    PUT: { [key in Role]: boolean };
};
