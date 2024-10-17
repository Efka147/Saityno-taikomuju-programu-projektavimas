import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Supplier, Warehouse, Good, ISupplier } from '../Schemas';
import { isValidObjectId } from 'mongoose';
import { isValidParam } from '../sharedFunctions';
import { Role, ValidRoles } from '../constants';
import { EndpointAccessType } from '../types';
const warehouseRouter = Router();
const validKeys = {
    put: ['location', 'sizeSquareMeters'],
};

const projection = { id: 1, supplier: 1, location: 1, sizeSquareMeters: 1 };
const rolesWithEndpoints: EndpointAccessType = {
    GET: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: false,
    },
    POST: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: false,
    },
    PUT: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: false,
    },
    DELETE: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: false,
    },
};
const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // const { role } = req.query;
    // if (!role || !ValidRoles.includes(Number(role))) {
    //     res.status(CODES.AUTH.BadRequest).json({ message: 'Role was not provided or was malformed' });
    //     return;
    // }
    // const method = req.method as keyof EndpointAccessType;
    // const userRole = Number(role) as Role;

    // if (!rolesWithEndpoints?.[method][userRole]) {
    //     res.status(CODES.AUTH.Unauthorized).json({ message: 'Unauthorized' });
    //     return;
    // }
    next();
};

warehouseRouter.get('/warehouse', authorizationMiddleware, async (req: Request, res: Response) => {
    res.status(CODES.GET.success).send(await Warehouse.find({}, projection));
});

warehouseRouter.get('/warehouse/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Warehouse id was not provided or is not a valid object id' });
        return;
    }
    const supplier = await Warehouse.findById(id, projection);
    if (supplier) res.status(CODES.GET.success).json(supplier);
    else res.status(CODES.GET.failure.NotFound).json({ message: 'Warehouse with provided id was not found' });
});

warehouseRouter.put('/warehouse/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Request body was not provided' });
        return;
    }
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Warehouse id is not valid' });
        return;
    }
    const { location, sizeSquareMeters } = req.body;
    const params = Object.keys(req.body);
    if (
        params.length > 2 ||
        params.length === 0 ||
        (location && (!isValidParam(location, 'string') || (await Warehouse.findOne({ location: location })))) ||
        (sizeSquareMeters && !isValidParam(sizeSquareMeters, 'number')) ||
        !params.every((param) => validKeys.put.includes(param))
    ) {
        if (location && (await Warehouse.findOne({ location: location }))) {
            res.status(CODES.PUT.failure.UnprocessableRequest).json({ messsage: 'Another warehouse is registered for the requested location' });
            return;
        }

        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Body is malformed' });
        return;
    }

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
        res.status(CODES.PUT.failure.NotFound).json({ message: 'Warehouse with provided id was not found' });
        return;
    } else {
        if (location !== undefined) warehouse.location = location;
        if (sizeSquareMeters !== undefined) warehouse.sizeSquareMeters = sizeSquareMeters;
        await warehouse.save();
        res.status(CODES.PUT.success).send();
    }
});

warehouseRouter.post('/warehouse', authorizationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Malformed body' });
        return;
    }
    const { supplier, location, sizeSquareMeters, ...rest } = req.body;

    if (
        (Object.keys(rest).length !== 0,
        Object.keys(req.body).length !== 3 ||
            !isValidParam(supplier, 'objID') ||
            !isValidParam(location, 'string') ||
            !isValidParam(sizeSquareMeters, 'number'))
    ) {
        res.status(CODES.POST.failure.BadRequest).json({ message: 'Malformed body' });
        return;
    }
    const existingSupplier = await Supplier.findById(supplier);
    if (!existingSupplier) {
        res.status(CODES.POST.failure.UnprocessableRequest).json({ message: 'Supplier with this id was not found' });
        return;
    }
    const existingWarehouse = await Warehouse.findOne({ location: location });
    if (existingWarehouse) {
        res.status(CODES.POST.failure.UnprocessableRequest).json({ message: 'Warehouse in this location already exists' });
        return;
    }
    await Warehouse.create({ supplier: existingSupplier._id, location: location, sizeSquareMeters: sizeSquareMeters });
    res.status(CODES.PUT.success).send();
});

warehouseRouter.delete('/warehouse/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.DELETE.failure.BadRequest).json({ message: 'Warehouse id is not valid' });
        return;
    }
    const result = await Warehouse.findById(id);
    if (!result) {
        res.status(CODES.DELETE.failure.NotFound).json({ message: 'Warehouse with provided id was not found' });
        return;
    }

    await Good.deleteMany({ warehouse: result._id });
    await result.deleteOne();

    res.status(CODES.DELETE.success.withoutBody).send();
});

export default warehouseRouter;
