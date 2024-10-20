import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Supplier, Warehouse, Good, ISupplier } from '../Schemas';
import { isValidObjectId } from 'mongoose';
import { isValidParam, makeErrorMessage } from '../sharedFunctions';
import { Role, ValidRoles } from '../constants';
import { EndpointAccessType } from '../types';
import goodRouter from './goodRouterr';
const warehouseRouter = Router({ mergeParams: true });
const validKeys = {
    put: ['location', 'sizeSquareMeters'],
};

const projection = { id: 1, supplier: 1, location: 1, sizeSquareMeters: 1 };
// const rolesWithEndpoints: EndpointAccessType = {
//     GET: {
//         [Role.ADMIN]: true,
//         [Role.SUPPLIER]: true,
//         [Role.WAREHOUSE]: false,
//     },
//     POST: {
//         [Role.ADMIN]: true,
//         [Role.SUPPLIER]: true,
//         [Role.WAREHOUSE]: false,
//     },
//     PUT: {
//         [Role.ADMIN]: true,
//         [Role.SUPPLIER]: true,
//         [Role.WAREHOUSE]: false,
//     },
//     DELETE: {
//         [Role.ADMIN]: true,
//         [Role.SUPPLIER]: true,
//         [Role.WAREHOUSE]: false,
//     },
// };
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

const relationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { supplierId, warehouseId } = req.params;
    if (!supplierId) {
        res.status(400).json(makeErrorMessage(400, 'Supplier id was not provided'));
        return;
    }
    if (!isValidObjectId(supplierId)) {
        res.status(400).json(makeErrorMessage(400, 'Supplier id is not a valid object id'));
        return;
    }
    if (req.method === 'POST' && (req.originalUrl.endsWith('warehouse') || req.originalUrl.endsWith('warehouse/'))) {
        next();
        return;
    }
    if (!warehouseId) {
        res.status(400).json(makeErrorMessage(400, 'Warehouse id was not provided'));
        return;
    }
    if (!isValidObjectId(warehouseId)) {
        res.status(400).json(makeErrorMessage(400, 'Warehouse id is not a valid object id'));
        return;
    }

    if (await Warehouse.find({ id: warehouseId, supplier: supplierId })) next();
    else res.status(404).json(makeErrorMessage(404, `Warehouse with provided id doesn't belong to provided supplier`));
};

warehouseRouter.get('/warehouse', authorizationMiddleware, async (req: Request, res: Response) => {
    const { supplierId } = req.params;
    if (!isValidObjectId(supplierId)) {
        res.status(CODES.GET.failure.BadRequest).json(
            makeErrorMessage(CODES.GET.failure.BadRequest, 'Supplier id was not provided or is not a valid object id')
        );
        return;
    }
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
        res.status(CODES.GET.failure.BadRequest).json(makeErrorMessage(CODES.GET.failure.BadRequest, 'Provided supplier does not exist '));
        return;
    }
    res.status(CODES.GET.success).send(await Warehouse.find({ supplier: supplier.id }, projection));
});

warehouseRouter.get('/warehouse/:warehouseId', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId, supplierId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.GET.failure.BadRequest).json(
            makeErrorMessage(CODES.GET.failure.BadRequest, 'Warehouse id was not provided or is not a valid object id')
        );
        return;
    }
    const supplier = await Warehouse.findOne({ supplier: supplierId, _id: warehouseId }, projection);
    if (supplier) res.status(CODES.GET.success).json(supplier);
    else res.status(CODES.GET.failure.NotFound).json(makeErrorMessage(CODES.GET.failure.NotFound, 'Warehouse with provided id was not found'));
});

warehouseRouter.put('/warehouse/:warehouseId', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).json(makeErrorMessage(CODES.PUT.failure.BadRequest, 'Request body was not provided'));
        return;
    }
    const { warehouseId, supplierId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.BadRequest).json(makeErrorMessage(CODES.PUT.failure.BadRequest, 'Warehouse id is not valid object id'));
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
            res.status(CODES.PUT.failure.UnprocessableRequest).json(
                makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Another warehouse is registered for the requested location')
            );
            return;
        }

        res.status(CODES.PUT.failure.BadRequest).json(makeErrorMessage(CODES.PUT.failure.BadRequest, 'Body is malformed'));
        return;
    }
    const warehouse = await Warehouse.findOne({ _id: warehouseId, supplier: supplierId });
    if (!warehouse) {
        res.status(CODES.PUT.failure.NotFound).json(makeErrorMessage(CODES.PUT.failure.NotFound, 'Warehouse with provided id was not found'));
        return;
    } else {
        if (location !== undefined) warehouse.location = location;
        if (sizeSquareMeters !== undefined) warehouse.sizeSquareMeters = sizeSquareMeters;
        await warehouse.save();
        res.status(CODES.PUT.success).send();
    }
});

warehouseRouter.post('/warehouse', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.POST.failure.BadRequest).json(makeErrorMessage(CODES.POST.failure.BadRequest, 'Body was not provided'));
        return;
    }
    const { supplierId } = req.params;
    const { location, sizeSquareMeters, ...rest } = req.body;

    if (
        (Object.keys(rest).length !== 0,
        Object.keys(req.body).length !== 2 ||
            !isValidParam(supplierId, 'objID') ||
            !isValidParam(location, 'string') ||
            !isValidParam(sizeSquareMeters, 'number'))
    ) {
        res.status(CODES.POST.failure.BadRequest).json(makeErrorMessage(CODES.POST.failure.BadRequest, 'Malformed body'));
        return;
    }
    const existingSupplier = await Supplier.findById(supplierId);
    if (!existingSupplier) {
        res.status(CODES.POST.failure.BadRequest).json(makeErrorMessage(CODES.POST.failure.BadRequest, 'Supplier with this id does not exist'));
        return;
    }
    const existingWarehouse = await Warehouse.findOne({ location: location });
    if (existingWarehouse) {
        res.status(CODES.POST.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Warehouse in this location already exists')
        );
        return;
    }
    await Warehouse.create({ supplier: existingSupplier._id, location: location, sizeSquareMeters: sizeSquareMeters });
    res.status(CODES.POST.success).send();
});

warehouseRouter.delete('/warehouse/:warehouseId', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId, supplierId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.DELETE.failure.BadRequest).json(makeErrorMessage(CODES.DELETE.failure.BadRequest, 'Warehouse id is not valid'));
        return;
    }
    if (!isValidObjectId(supplierId)) {
        res.status(CODES.DELETE.failure.BadRequest).json(makeErrorMessage(CODES.DELETE.failure.BadRequest, 'Supplier id is not valid'));
        return;
    }
    const result = await Warehouse.findOne({ _id: warehouseId, supplier: supplierId });
    if (!result) {
        res.status(CODES.DELETE.failure.NotFound).json(makeErrorMessage(CODES.DELETE.failure.NotFound, 'Warehouse with provided id was not found'));
        return;
    }

    await Good.deleteMany({ warehouse: result._id });
    await result.deleteOne();

    res.status(CODES.DELETE.success.withoutBody).send();
});

warehouseRouter.use('/warehouse/:warehouseId', relationMiddleware, goodRouter);

export default warehouseRouter;
