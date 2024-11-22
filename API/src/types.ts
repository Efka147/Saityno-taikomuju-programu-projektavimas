import { Roles } from './db/schemas';

export type EndpointAccessType = { [key: string]: { [key in Roles]: boolean } };
