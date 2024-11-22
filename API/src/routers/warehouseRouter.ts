import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Supplier, Warehouse, Good, Roles, User } from '../db/schemas';
import { isValidObjectId } from 'mongoose';
import { isValidParam, makeErrorMessage, parsePayload } from '../sharedFunctions';
import goodRouter from './goodRouterr';
import { EndpointAccessType } from '../types';
const warehouseRouter = Router({ mergeParams: true });
const validKeys = {
    put: ['location', 'sizeSquareMeters'],
};

const projection = { id: 1, supplier: 1, location: 1, sizeSquareMeters: 1 };
const rolesWithEndpoints: EndpointAccessType = {
    GET: {
        [Roles.ADMIN]: true,
        [Roles.SUPPLIER]: true,
        [Roles.WAREHOUSE]: true,
    },
    POST: {
        [Roles.ADMIN]: true,
        [Roles.SUPPLIER]: true,
        [Roles.WAREHOUSE]: false,
    },
    PUT: {
        [Roles.ADMIN]: true,
        [Roles.SUPPLIER]: true,
        [Roles.WAREHOUSE]: false,
    },
    DELETE: {
        [Roles.ADMIN]: true,
        [Roles.SUPPLIER]: false,
        [Roles.WAREHOUSE]: false,
    },
};
const authorizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const payload = parsePayload(req, res);
    if (!payload) return;
    if (payload?.aud === Roles.ADMIN) {
        next();
        return;
    }
    if (rolesWithEndpoints[req.method][payload.aud as Roles]) {
        if (payload.aud === Roles.WAREHOUSE) {
            const { warehouseId } = req.params;
            const subject = await User.getSubjectId(payload.sub!);
            if (warehouseId === subject) next();
            else res.status(CODES.AUTH.Forbidden).json(makeErrorMessage(CODES.AUTH.Forbidden, 'Not allowed'));
        } else next();
    } else res.status(CODES.AUTH.Forbidden).json(makeErrorMessage(CODES.AUTH.Forbidden, 'Not allowed'));
};

const relationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { supplierId, warehouseId } = req.params;
    if (!supplierId) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Supplier id was not provided')
        );
        return;
    }
    if (!isValidObjectId(supplierId)) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Supplier id is not a valid object id')
        );
        return;
    }
    if (req.method === 'POST' && (req.originalUrl.endsWith('warehouse') || req.originalUrl.endsWith('warehouse/'))) {
        next();
        return;
    }
    if (!warehouseId) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Warehouse id was not provided')
        );
        return;
    }
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Warehouse id is not a valid object id')
        );
        return;
    }

    if (await Warehouse.find({ id: warehouseId, supplier: supplierId })) next();
    else res.status(404).json(makeErrorMessage(404, `Warehouse with provided id doesn't belong to provided supplier`));
};

warehouseRouter.get('/warehouse', authorizationMiddleware, async (req: Request, res: Response) => {
    const { supplierId } = req.params;
    if (!isValidObjectId(supplierId)) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Supplier id was not provided or is not a valid object id')
        );
        return;
    }
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Provided supplier does not exist ')
        );
        return;
    }
    res.status(CODES.GET.success).send(await Warehouse.find({ supplier: supplier.id }, projection));
});

warehouseRouter.get('/warehouse/:warehouseId', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId, supplierId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.GET.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Warehouse id was not provided or is not a valid object id')
        );
        return;
    }
    const supplier = await Warehouse.findOne({ supplier: supplierId, _id: warehouseId }, projection);
    if (supplier) res.status(CODES.GET.success).json(supplier);
    else res.status(CODES.GET.failure.NotFound).json(makeErrorMessage(CODES.GET.failure.NotFound, 'Warehouse with provided id was not found'));
});

warehouseRouter.put('/warehouse/:warehouseId', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Request body was not provided')
        );
        return;
    }
    const { warehouseId, supplierId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Warehouse id is not valid object id')
        );
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

        res.status(CODES.PUT.failure.UnprocessableRequest).json(makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Body is malformed'));
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
        res.status(CODES.POST.failure.UnprocessableRequest).json(makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Body was not provided'));
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
        res.status(CODES.POST.failure.UnprocessableRequest).json(makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Malformed body'));
        return;
    }
    const existingSupplier = await Supplier.findById(supplierId);
    if (!existingSupplier) {
        res.status(CODES.POST.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Supplier with this id does not exist')
        );
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
        res.status(CODES.DELETE.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.DELETE.failure.UnprocessableRequest, 'Warehouse id is not valid')
        );
        return;
    }
    if (!isValidObjectId(supplierId)) {
        res.status(CODES.DELETE.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.DELETE.failure.UnprocessableRequest, 'Supplier id is not valid')
        );
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
