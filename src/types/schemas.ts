import { z } from 'zod';

// 用户注册和登录模式
export const RegisterSchema = z.object({ 
    email: z.string().email(), 
    password: z.string().min(8) 
});

export const LoginSchema = z.object({ 
    email: z.string().email(), 
    password: z.string() 
});

// 购物车操作模式
export const AddToCartSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
});

export const UpdateCartSchema = z.object({
    quantity: z.number().int().min(1),
});

// 产品管理模式
export const CreateProductSchema = z.object({
    price: z.number().positive(),
    featured: z.boolean().optional().default(false),
    categoryId: z.number().int().positive().optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    lang: z.string().optional().default('en')
});

export const UpdateProductSchema = z.object({
    price: z.number().positive().optional(),
    featured: z.boolean().optional(),
    categoryId: z.number().int().positive().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
});

// 用户资料管理模式
export const CreateUserProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dateOfBirth: z.string().datetime().optional(),
    avatar: z.string().url().optional(),
});

export const UpdateUserProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dateOfBirth: z.string().datetime().optional(),
    avatar: z.string().url().optional(),
});

// 用户地址管理模式
export const CreateAddressSchema = z.object({
    title: z.string().min(1),
    recipientName: z.string().min(1),
    recipientPhone: z.string().min(1),
    country: z.string().min(1),
    province: z.string().min(1),
    city: z.string().min(1),
    district: z.string().optional(),
    streetAddress: z.string().min(1),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional().default(false),
});

export const UpdateAddressSchema = z.object({
    title: z.string().min(1).optional(),
    recipientName: z.string().min(1).optional(),
    recipientPhone: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    province: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    district: z.string().optional(),
    streetAddress: z.string().min(1).optional(),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional(),
});

// 密码管理模式
export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});