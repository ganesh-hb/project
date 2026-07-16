import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, COMPANY_SCOPED } from './roles.guard';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const CompanyScoped = () => SetMetadata(COMPANY_SCOPED, true);
