import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Warehouse, Good } from '../Schemas';
import { isValidObjectId } from 'mongoose';
import { isValidParam } from '../sharedFunctions';
import { Role, ValidRoles } from '../constants';
import { EndpointAccessType } from '../types';
const goodRouter = Router();
const validKeys = {
    put: ['warehouse', 'name', 'description'],
};

const projection = { id: 1, warehouse: 1, name: 1, description: 1 };
const rolesWithEndpoints: EndpointAccessType = {
    GET: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: true,
    },
    POST: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: true,
    },
    PUT: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: true,
    },
    DELETE: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: true,
        [Role.WAREHOUSE]: true,
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

goodRouter.get('/good', authorizationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.GET.failure.BadRequest).send({ message: 'Warehouse id is not a valid object id' });
        return;
    }
    res.status(CODES.GET.success).send(await Good.find({ warehouse: warehouseId }, projection));
});

goodRouter.get('/good/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    const { id, warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Warehouse id is not a valid object id' });
        return;
    }
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Good id is not a valid object id' });
        return;
    }
    const good = await Good.findOne({ id: id, warehouse: warehouseId }, projection);
    if (good) res.status(CODES.GET.success).json(good);
    else res.status(CODES.GET.failure.NotFound).json({ message: 'Good with provided id was not found' });
});

goodRouter.put('/good/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Request body was not provided' });
        return;
    }
    const { id, warehouseId } = req.params;

    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Warehouse id is not a valid object id' });
        return;
    }

    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Good id is not valid' });
        return;
    }
    const { warehouse, name, description } = req.body;
    const params = Object.keys(req.body);
    if (
        params.length > 3 ||
        params.length === 0 ||
        (warehouse && !isValidParam(warehouse, 'objID')) ||
        (name && !isValidParam(name, 'string')) ||
        (description && !isValidParam(description, 'string')) ||
        !params.every((param) => validKeys.put.includes(param))
    ) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Body is malformed' });
        return;
    }

    const good = await Good.findOne({ id: id, warehouse: warehouseId });
    if (!good) {
        res.status(CODES.PUT.failure.NotFound).json({ message: 'Good with provided id was not found' });
        return;
    } else {
        if (warehouse !== undefined) good.warehouse = warehouse;
        if (name !== undefined) good.name = name;
        if (description !== undefined) good.description = description;
        await good.save();
        res.status(CODES.PUT.success).send();
    }
});

goodRouter.post('/good', authorizationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Warehouse id is not a valid object id' });
        return;
    }
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Malformed body' });
        return;
    }
    const { name, description, ...rest } = req.body;

    if (
        (Object.keys(rest).length !== 0, Object.keys(req.body).length !== 3 || !isValidParam(name, 'string') || !isValidParam(description, 'string'))
    ) {
        res.status(CODES.POST.failure.BadRequest).json({ message: 'Malformed body' });
        return;
    }
    const existingWarehouse = await Warehouse.findById(warehouseId);
    if (!existingWarehouse) {
        res.status(CODES.POST.failure.UnprocessableRequest).json({ message: 'Warehouse with this id was not found' });
        return;
    }

    await Good.create({ warehouse: warehouseId, name: name, description: description });
    res.status(CODES.PUT.success).send();
});

goodRouter.delete('/good/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    const { id, warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Warehouse id is not a valid object id' });
        return;
    }
    if (!isValidObjectId(id)) {
        res.status(CODES.DELETE.failure.BadRequest).json({ message: 'Good id is not valid' });
        return;
    }
    const result = await Good.findOne({ id: id, warehouse: warehouseId });
    if (!result) {
        res.status(CODES.DELETE.failure.NotFound).json({ message: 'Good with provided id was not found' });
        return;
    }

    await result.deleteOne();
    res.status(CODES.DELETE.success.withoutBody).send();
});

export default goodRouter;
