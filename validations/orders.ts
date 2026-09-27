import * as yup from "yup";

import { ORDER_STATUS } from "@/types";

const objectId = /^[a-f\d]{24}$/i;

export const addCartItemSchema = yup.object({
  productId: yup
    .string()
    .matches(objectId, "Select a valid product")
    .required("Product is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a whole number")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least one")
    .max(1000000, "Quantity is too high")
    .required("Quantity is required"),
});

export const cartQuantitySchema = yup.object({
  quantity: yup
    .number()
    .typeError("Quantity must be a whole number")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least one")
    .max(1000000, "Quantity is too high")
    .required("Quantity is required"),
});

export const orderStatusSchema = yup.object({
  status: yup
    .mixed<(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]>()
    .oneOf(Object.values(ORDER_STATUS), "Select a valid order status")
    .required("Order status is required"),
});

export const cancelOrderSchema = yup.object({
  status: yup
    .mixed<typeof ORDER_STATUS.CANCELLED>()
    .oneOf([ORDER_STATUS.CANCELLED], "Only pending orders may be cancelled")
    .required(),
});

export type AddCartItemInput = yup.InferType<typeof addCartItemSchema>;
export type CartQuantityInput = yup.InferType<typeof cartQuantitySchema>;
