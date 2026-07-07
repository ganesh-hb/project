import z from "zod";

export const userLoginSchema = z.object({
    email: z.email('Invalid email')
        .min(1, "Email is required"),

    password: z.string()
        .min(1, "Password is required")
        .max(100, "Password must be at most 100 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain uppercase, lowercase, number, and special character"
        ),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const UpdateFormSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email, enter valid email"),

    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be at most 50 characters"),

    age: z
        .coerce
        .number({
            required_error: "Age is required",
            invalid_type_error: "Age must be a number",
        })
        .min(18, { message: "You must be at least 18 years old" }),

    phone: z.string()
        .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

    alternatePhone: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
            message: "Invalid phone number",
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
        .min(2, "Email is required")
        .email("Invalid email, enter valid email"),

    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be at most 50 characters"),

    age: z
        .coerce
        .number({
            required_error: "Age is required",
            invalid_type_error: "Age must be a number",
        })
        .min(18, { message: "You must be at least 18 years old" }),
    // .regex(/^[6-9]\d{9}$/, "Invalid phone number")
    phone: z.string()
        .max(5, "Enter valid phone number")
    ,

    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
            "Password must contain uppercase, lowercase, number, and special character"
        ),
    alternatePhone: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
            message: "Invalid phone number",
        }),

    groupId: z.string().min(1, "Please select a role"),
    companyId: z.string().min(1, "Please select a company"),

    userFile: z.any()
        .refine((file) => !!file, "Profile image is required.")
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
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    companyCode: z.string().min(2, "Company code must be at least 2 characters"),
    companyLocation: z.string().min(2, "Location is required"),
    status: z.enum(["active", "inactive", "pending", "block"], {
        errorMap: () => ({ message: "Select a valid status" }),
    }),
    email: z.string()
        .min(2, "Email is required")
        .email("Invalid email, enter valid email"),
    website: z.string().min(2, "Website is required"),
    dialCode: z.union([z.coerce.number(), z.literal(""), z.undefined()]),
    phone: z
        .string({ required_error: "Phone number is required" })
        .min(1, { message: "Phone number is required" })
        .max(10, { message: "Enter valid Phone number" })
        .regex(/^\d+$/, { message: "Enter valid Phone number" }),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    ownerName: z.string().min(2, "Owner Name is required"),
    ownerEmail: z.string().min(2, "Ownwer Email is required")
        .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid owner email"),
    ownerPhone: z.string().min(2, "Owner phone is required"),
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