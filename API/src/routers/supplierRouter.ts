import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Supplier, Warehouse, Good, ISupplier } from '../Schemas';
import { isValidObjectId } from 'mongoose';
import { isValidParam } from '../sharedFunctions';
import { Role, ValidRoles } from '../constants';
import { EndpointAccessType } from '../types';
const supplierRouter = Router();
const validKeys = {
    put: ['name', 'description', 'rating'],
};

const projection = { id: 1, name: 1, description: 1, rating: 1 };
const rolesWithEndpoints: EndpointAccessType = {
    GET: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: false,
        [Role.WAREHOUSE]: false,
    },
    POST: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: false,
        [Role.WAREHOUSE]: false,
    },
    PUT: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: false,
        [Role.WAREHOUSE]: false,
    },
    DELETE: {
        [Role.ADMIN]: true,
        [Role.SUPPLIER]: false,
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

supplierRouter.get('/supplier', authorizationMiddleware, async (req: Request, res: Response) => {
    res.status(CODES.GET.success).send(await Supplier.find({}, projection));
});

supplierRouter.get('/supplier/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Supplier id was not provided or is not a valid object id' });
        return;
    }
    const supplier = await Supplier.findById(id, projection);
    if (supplier) res.status(CODES.GET.success).json(supplier);
    else res.status(CODES.GET.failure.NotFound).json({ message: 'Supplier with provided id was not found' });
});

supplierRouter.put('/supplier/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Request body was not provided' });
        return;
    }
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Supplier id is not valid' });
        return;
    }
    const { name, description, rating } = req.body;
    const params = Object.keys(req.body);
    if (
        params.length > 4 ||
        params.length === 0 ||
        (name && !isValidParam(name, 'string')) ||
        (description && !isValidParam(description, 'string')) ||
        (rating !== undefined && rating !== null && !isValidParam(rating, 'number')) ||
        !params.every((param) => validKeys.put.includes(param))
    ) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Body is malformed' });
        return;
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
        res.status(CODES.PUT.failure.NotFound).json({ message: 'Supplier with provided id was not found' });
        return;
    } else {
        if (name !== undefined) supplier.name = name;
        if (description !== undefined) supplier.description = description;
        if (rating !== undefined) supplier.rating = rating;
        await supplier.save();
        res.status(CODES.PUT.success).send();
    }
});

supplierRouter.post('/supplier', authorizationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json({ message: 'Malformed body' });
        return;
    }
    const { name, description, rating, ...rest } = req.body;

    if (
        (Object.keys(rest).length !== 0,
        Object.keys(req.body).length !== 3 ||
            !isValidParam(name, 'string') ||
            !isValidParam(description, 'string') ||
            !isValidParam(rating, 'number'))
    ) {
        res.status(CODES.POST.failure.BadRequest).json({ message: 'Malformed body' });
        return;
    }

    const existingSupplier = await Supplier.findOne({ name: name });
    if (existingSupplier) {
        res.status(CODES.POST.failure.UnprocessableRequest).json({ message: 'Supplier with this name already exists' });
        return;
    }
    await Supplier.create({ name: name, description: description, rating: rating });
    res.status(CODES.PUT.success).send();
});

supplierRouter.delete('/supplier/:id', authorizationMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.DELETE.failure.BadRequest).json({ message: 'Supplier id is not valid' });
        return;
    }
    const result = await Supplier.findById(id);
    if (!result) {
        res.status(CODES.DELETE.failure.NotFound).json({ message: 'Supplier with provided id was not found' });
        return;
    }

    const warehouses = await Warehouse.find({ supplier: result._id });

    for (const warehouse of warehouses) {
        await Good.deleteMany({ warehouse: warehouse._id });
        await warehouse.deleteOne();
    }
    await result.deleteOne();

    res.status(CODES.DELETE.success.withoutBody).send();
});

export default supplierRouter;
