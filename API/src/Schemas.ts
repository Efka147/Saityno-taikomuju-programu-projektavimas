import { model, Schema, Document, Types } from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    description: string;
    rating: number;
}

export interface IWarehouse extends Document {
    supplier: Types.ObjectId;
    location: string;
    sizeSquareMeters: number;
}

export interface IGood extends Document {
    warehouse: Types.ObjectId;
    name: string;
    description: string;
}

const supplierSchema = new Schema<ISupplier>({
    name: String,
    description: String,
    rating: Number,
});

const warehouseSchema = new Schema<IWarehouse>({
    supplier: Types.ObjectId,
    location: String,
    sizeSquareMeters: Number,
});
const goodSchema = new Schema<IGood>({
    warehouse: Types.ObjectId,
    name: String,
    description: String,
});

export const Supplier = model<ISupplier>('supplier', supplierSchema);
export const Warehouse = model<IWarehouse>('warehouse', warehouseSchema);
export const Good = model<IGood>('good', goodSchema);
