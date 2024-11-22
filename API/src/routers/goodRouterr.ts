import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Warehouse, Good } from '../db/schemas';
import { isValidObjectId } from 'mongoose';
import { isValidParam, makeErrorMessage, parsePayload } from '../sharedFunctions';
const goodRouter = Router({ mergeParams: true });
const validKeys = {
    put: ['name', 'description'],
};

const projection = { id: 1, warehouse: 1, name: 1, description: 1 };

const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const payload = parsePayload(req, res);
    if (!payload) return;
    next();
};

const relationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { warehouseId, id } = req.params;

    if (!(await Warehouse.findById(warehouseId))) {
        res.status(CODES.GET.failure.UnprocessableRequest).send(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Provided warehouse does not exist ')
        );
        return;
    }

    if (await Good.find({ id: id, warehouse: warehouseId })) next();
    else res.status(404).json(makeErrorMessage(404, `Good with provided id doesn't belong to provided warehouse`));
};
goodRouter.get('/good', authorizationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.GET.failure.UnprocessableRequest).send(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Warehouse id is not a valid object id')
        );
        return;
    }
    if (!(await Warehouse.findById(warehouseId))) {
        res.status(CODES.GET.failure.UnprocessableRequest).send(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Provided warehouse does not exist ')
        );
    }
    res.status(CODES.GET.success).send(await Good.find({ warehouse: warehouseId }, projection));
});

goodRouter.get('/good/:id', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    const { id, warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.GET.failure.UnprocessableRequest).send(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Warehouse id is not a valid object id')
        );
        return;
    }
    if (!isValidObjectId(id)) {
        res.status(CODES.GET.failure.UnprocessableRequest).send(
            makeErrorMessage(CODES.GET.failure.UnprocessableRequest, 'Good id is not a valid object id')
        );
        return;
    }
    const good = await Good.findOne({ _id: id, warehouse: warehouseId }, projection);
    if (good) res.status(CODES.GET.success).json(good);
    else res.status(CODES.GET.failure.NotFound).json(makeErrorMessage(CODES.GET.failure.NotFound, 'Good with provided id was not found'));
});

goodRouter.put('/good/:id', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Request body was not provided')
        );
        return;
    }
    const { id, warehouseId } = req.params;

    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.PUT.failure.UnprocessableRequest).send(
            makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Warehouse id is not a valid object id')
        );
        return;
    }

    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Good id is not valid object id')
        );
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
        res.status(CODES.PUT.failure.UnprocessableRequest).json(makeErrorMessage(CODES.PUT.failure.UnprocessableRequest, 'Body is malformed'));
        return;
    }

    const good = await Good.findOne({ _id: id, warehouse: warehouseId });
    if (!good) {
        res.status(CODES.PUT.failure.NotFound).json(makeErrorMessage(CODES.PUT.failure.NotFound, 'Good with provided id was not found'));
        return;
    } else {
        if (warehouse !== undefined) good.warehouse = warehouse;
        if (name !== undefined) good.name = name;
        if (description !== undefined) good.description = description;
        await good.save();
        res.status(CODES.PUT.success).send();
    }
});

goodRouter.post('/good', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    const { warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.POST.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Warehouse id is not a valid object id')
        );
        return;
    }
    if (!req.body) {
        res.status(CODES.POST.failure.UnprocessableRequest).json(makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Body was not provided'));
        return;
    }
    const { name, description, ...rest } = req.body;

    if (
        (Object.keys(rest).length !== 0, Object.keys(req.body).length !== 2 || !isValidParam(name, 'string') || !isValidParam(description, 'string'))
    ) {
        res.status(CODES.POST.failure.UnprocessableRequest).json(makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Malformed Body'));
        return;
    }
    const existingWarehouse = await Warehouse.findById(warehouseId);
    if (!existingWarehouse) {
        res.status(CODES.POST.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.POST.failure.UnprocessableRequest, 'Warehouse with this id does not exist')
        );
        return;
    }

    await Good.create({ warehouse: warehouseId, name: name, description: description });
    res.status(CODES.POST.success).send();
});

goodRouter.delete('/good/:id', authorizationMiddleware, relationMiddleware, async (req: Request, res: Response) => {
    const { id, warehouseId } = req.params;
    if (!isValidObjectId(warehouseId)) {
        res.status(CODES.DELETE.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.DELETE.failure.UnprocessableRequest, 'Warehouse id is not a valid object id')
        );
        return;
    }
    if (!isValidObjectId(id)) {
        res.status(CODES.DELETE.failure.UnprocessableRequest).json(
            makeErrorMessage(CODES.DELETE.failure.UnprocessableRequest, 'Good id is not valid object id')
        );
        return;
    }
    const result = await Good.findOne({ _id: id, warehouse: warehouseId });
    if (!result) {
        res.status(CODES.DELETE.failure.NotFound).json(makeErrorMessage(CODES.DELETE.failure.NotFound, 'Good with provided id was not found'));
        return;
    }

    await result.deleteOne();
    res.status(CODES.DELETE.success.withoutBody).send();
});

export default goodRouter;
