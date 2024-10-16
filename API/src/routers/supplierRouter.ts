import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { Supplier, Warehouse, Good, ISupplier } from '../Schemas';
import { isValidObjectId } from 'mongoose';
const supplierRouter = Router();

const authentication = (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.params;

    if (!role) return res.status(CODES.AUTH.BadRequest).send({ message: 'Role was not provided' });

    next();
};

supplierRouter.get('/supplier', async (req: Request, res: Response) => {
    res.send(CODES.GET).json(await Supplier.find({}));
});

supplierRouter.get('/supplier/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Supplier id was not provided or is not a valid object id' });
        return;
    }
    const supplier = await Supplier.findById(id);
    if (supplier) res.status(CODES.GET.success).json(supplier);
    else res.status(CODES.GET.failure.NotFound).json({ message: 'Supplier with provided id was not found' });
});

supplierRouter.put('/supplier/:id', async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Malformed body' });
        return;
    }
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Supplier id is not valid' });
        return;
    }
    const { name, description, rating } = req.body;
    const paramCount = Object.keys(req.body).length;
    if (
        paramCount > 4 ||
        paramCount === 0 ||
        (name && typeof name !== 'string') ||
        (description && typeof description !== 'string') ||
        (rating && typeof rating !== 'number')
    ) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Body is malformed' });
        return;
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
        res.status(CODES.PUT.failure.NotFound).send({ message: 'Supplier with provided id was not found' });
        return;
    } else {
        if (name !== undefined) supplier.name = name;
        if (description !== undefined) supplier.description = description;
        if (rating !== undefined) supplier.rating = rating;
        await supplier.save();
        res.status(CODES.PUT.success).send();
    }
});

supplierRouter.post('/supplier', async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(CODES.PUT.failure.BadRequest).send({ message: 'Malformed body' });
        return;
    }
    const { name, description, rating } = req.body;
    if (
        Object.keys(req.body).length !== 3 ||
        !name ||
        typeof name !== 'string' ||
        !description ||
        typeof description !== 'string' ||
        rating === undefined ||
        rating === null ||
        typeof rating !== 'number'
    ) {
        res.status(CODES.POST.failure.BadRequest).send({ message: 'Malformed body' });
        return;
    }

    const existingSupplier = await Supplier.findOne({ name: name });
    if (existingSupplier) {
        res.send(CODES.POST.failure.UnprocessableRequest).send({ message: 'Supplier with this name already exists' });
        return;
    }
    await Supplier.create({ name: name, description: description, rating: rating });
    res.status(CODES.PUT.success).send();
});

supplierRouter.delete('/supplier/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(CODES.DELETE.failure.BadRequest).send({ message: 'Supplier id is not valid' });
        return;
    }
    const result = await Supplier.findOne({ _id: id });
    if (!result) {
        res.status(CODES.DELETE.failure.NotFound).send({ message: 'Supplier with provided id was not found' });
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
