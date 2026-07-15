import { min } from "date-fns";
import z from "zod";

export const userLoginSchema = z.object({
    email: z.string()
        .min(2, "Please enter Email.")
        .email('Invalid email.'),

    password: z.string()
        .min(1, "Please enter the Password.")
        .max(10, "Password must be at most 100 characters."),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const UpdateFormSchema = z.object({
    email: z.string()
        .min(2, "Please enter Email.")
        .email("Please enter valid Email."),

    name: z.string()
        .min(1, "Please enter the UserName.")
        .max(10, "UserName must be at most 10 characters.")
        .regex(/^\S+$/, "UserName cannot contain spaces."),

    status: z.enum(["Active", "Inactive"], {
        errorMap: () => ({ message: "Please Select a valid status." }),
    }),

    firstName: z.string()
        .min(1, "Please enter the First Name.")
        .max(50, "First name must be at most 50 characters.")
        .regex(/^[a-zA-Z0-9]+$/, "First Name cannot contain special characters."),

    middleName: z.string()
        .max(50, "Middle name must be at most 50 characters.")
        .regex(/^[a-zA-Z0-9]+$/, "Middle Name cannot contain special characters.")
        .optional()
        .or(z.literal("")),

    surname: z.string()
        .min(1, "Please enter the Last name.")
        .max(50, "Last name must be at most 50 characters."),
    // .regex(/^[a-zA-Z0-9]+$/, "Surname cannot contain special characters."),

    age: z
        .coerce
        .number({
            required_error: "Please enter the Age.",
            invalid_type_error: "Age must be a Number.",
        })
        .min(18, { message: "You must be at least 18 years old." }),

    phone: z.string().min(1, "Please Enter Phone number "),
    dialCode: z.string().optional().or(z.literal("")),

    alternatePhone: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
            message: "Invalid phone number.",
        }),

    userFile: z.any()
        .optional()
        .refine((file) => {
            if (!file) return true;
            return file.size <= MAX_FILE_SIZE;
        }, "Max file size is 5MB.")
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, ".jpg, .jpeg, .png and .webp files are accepted."),
});

export const AddFormSchema = z.object({
    email: z.string()
        .min(2, "Please enter Email.")
        .email("Invalid email, enter valid Email."),

    name: z.string()
        .min(1, "Please enter UserName. ")
        .max(10, "UserName must be at most 50 characters."),

    firstName: z.string()
        .min(1, "Please enter First name.")
        .max(50, "First name must be at most 50 characters."),

    middleName: z.string()
        .max(50, "Middle name must be at most 50 characters.")
        .optional()
        .or(z.literal("")),

    surname: z.string()
        .min(1, "Please enter Last name.")
        .max(50, "Last name must be at most 50 characters."),

    status: z.enum(["Active", "Inactive"], {
        errorMap: () => ({ message: "Please Select a valid Status." }),
    }),

    phone: z.string()
        .min(1, "Please enter Phone Number")
    ,

    password: z
        .string()
        .min(1, "Please enter Password.")
        .min(8, "Password must be at least 8 characters long.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
            "Password must contain uppercase, lowercase, number, and special character."
        ),
    alternatePhone: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
            message: "Invalid Phone Number.",
        }),

    groupId: z.string().min(1, "Please select Role."),
    companyId: z.string().min(1, "Please select Company."),

    userFile: z.any()
        .optional()
        .refine((file) => {
            if (!file) return true;
            return file.size <= MAX_FILE_SIZE;
        }, "Max file size is 5MB.")
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, ".jpg, .jpeg, .png and .webp files are accepted."),
});

export const CompanyUpdateSchema = z.object({
    companyName: z.string().
        min(1, "Please enter Company Name."),
    companyCode: z.string()
        .min(1, "Please enter Company Code.")
        .min(2, "Company Code should be more that 2 Letters"),
    AddressLineOne: z.string().
        min(1, "please enter Address Line 1.")
        .min(2, "Address Line should be more than 2 letters"),
    status: z.enum(["active", "inactive"], {
        errorMap: () => ({ message: "Please Select a valid Status." }),
    }),
    companyFile: z.any()
        .optional()
        .refine((file) => {
            if (!file) return true;
            return file.size <= MAX_FILE_SIZE;
        }, "Max file size is 5MB.")
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, ".jpg, .jpeg, .png and .webp files are accepted."),
    email: z.string()
        .min(2, "Please enter Email")
        .email("Invalid email, enter valid Email."),
    website: z.string()
        .min(2, "Please enter Website."),
    dialCode: z.union([z.coerce.number("Please enter DialCode"), z.literal(""), z.undefined()]),
    phone: z
        .string({ required_error: "Please enter Phone number." })
        .min(1, { message: "Please enter Phone Number." })
        .max(10, { message: "Enter valid Phone Number." })
        .regex(/^\d+$/, { message: "Enter valid Phone Number." }),
    country: z.string()
        .min(1, "Please select Country "),
    state: z.string()
        .min(1, "Please select State "),
    city: z.string()
        .min(1, "Please select City "),
    ownerName: z.string().min(2, "Please enter Owner Name."),
    ownerEmail: z.string().min(2, "Please enter Owner Email.")
        .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid owner email."),
    ownerPhone: z.string().min(2, "Please enter Owner phone. "),
    companyFile: z.any()
        .optional()
        .refine((file) => {
            if (!file) return true;
            return file.size <= MAX_FILE_SIZE;
        }, "Max file size is 5MB.")
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, ".jpg, .jpeg, .png and .webp files are accepted."),
});

export const ResetPasswordSchema = z.object({
    password: z.string()
        .min(1, "Please enter the Password.")
        .max(100, "Password must be at most 100 characters.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number, and special character."
        ),
    confirmPass: z.string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPass, {
    message: "Passwords do not match",
    path: ["confirmPass"],
});

export const ChangePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Current password is required"),
    newPassword: z.string()
        .min(1, "Please enter the Password.")
        .max(100, "Password must be at most 100 characters.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number, and special character."
        ),
    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
});

export const GroupFormSchema = z.object({
    groupName: z.string()
        .trim()
        .min(2, "Group name must be at least 2 characters.")
        .max(50, "Group name must be at most 50 characters."),

    groupCode: z.string()
        .trim()
        .min(2, "Group code must be at least 2 characters.")
        .max(20, "Group code must be at most 20 characters."),

    status: z.enum(["active", "inactive"], {
        errorMap: () => ({ message: "Status is required." }),
    }),
});