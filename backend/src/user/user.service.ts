import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/packages/entity/user.entity';
import { GroupEntity } from 'src/packages/entity/group.entity';
import { CompanyEntity } from 'src/packages/entity/company.entity';

import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import bcrypt from 'bcrypt';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { JwtService } from '@nestjs/jwt';
import { GroupPermissionEntity } from 'src/packages/entity/capability.entity';

@Injectable()
export class UserService {
    constructor(
        private readonly fileTransfer: FileTransfer,
        private readonly filter: Filter,
        private readonly mailer: Mailer,

        @InjectRepository(UserEntity)
        private readonly userEntity: Repository<UserEntity>,

        @InjectRepository(GroupEntity)
        private readonly groupEntity: Repository<GroupEntity>,

        @InjectRepository(CompanyEntity)
        private readonly companyEntity: Repository<CompanyEntity>,

        @InjectRepository(UserCompanyGroupEntity)
        private readonly ucgEntity: Repository<UserCompanyGroupEntity>,

        @InjectRepository(GroupPermissionEntity)
        private readonly groupPermissionEntity: Repository<GroupPermissionEntity>,

        private readonly jwtService: JwtService,
    ) {}


    private async saveAssignments(
        userId: number,
        assignments: { companyId: number; groupId: number; is_parent?: number }[],
        replace = false,
    ) {
        if (replace) {
            await this.ucgEntity.delete({ userId });
        }

        if (!assignments?.length) return;

        const rows = assignments.map((a) =>
            this.ucgEntity.create({
                userId,
                companyId: Number(a.companyId),
                groupId: Number(a.groupId),
                is_parent: (a.is_parent === null || a.is_parent === undefined) ? userId : a.is_parent,
            }),
        );

        await this.ucgEntity.save(rows);
    }

    private async loadUserWithAssignments(userId: number) {
        return this.userEntity.findOne({
            where: { userId },
            relations: [
                'userCompanyGroups',
                'userCompanyGroups.company',
                'userCompanyGroups.group',
            ],
        });
    }

    async startInsertUser(params: any, userFile: any) {
        const res = await this.insertUser(params, userFile);
        if (res.success === 1) {
            return this.finishSuccess(res, params, userFile);
        }
        return this.finishFailure(res);
    }

    async insertUser(params: any, userFile: any) {
        try {
            const user = this.userEntity.create({
                name: params.name,
                email: params.email,
                age: params.age,
                password: await bcrypt.hash(params.password, 10),
                phone: params.phone,
                status: params.status,
                userFile: userFile ? userFile.filename : null,
                dialCode: params?.dialCode || null,
                createdBy: params?.createdBy || null,
                updatedBy: params?.updatedBy || null,
            });

            const saved = await this.userEntity.save(user);

            if (params.companyId && params.groupId) {
                await this.saveAssignments(
                    saved.userId,
                    [{
                        companyId: params?.companyId,
                        groupId:   params?.groupId,
                        is_parent: params?.is_parent ?? undefined,
                    }],
                    false,
                );
            }

            return {
                success: 1,
                message: 'Inserted successfully',
                data: { insertData: saved.userId },
            };
        } catch (err: any) {
            return { success: 0, message: err.message };
        }
    }

    async finishSuccess(res: any, params: any, userFile: any) {
        const userId = Number(res?.data?.insertData);
        const output: any = {
            settings: {
                userId,
                success: res?.success,
                message: res?.message,
                data: params,
            },
        };

        if (userFile?.filename) {
            await this.fileTransfer.fileTransfer(userFile.filename, userId, userId);
        }

        return output;
    }

    async finishFailure(res: any) {
        return res;
    }

async startUpdate(params: any, userFile?: any, req?: any) {
    if (req?.scopedCompanyIds?.length) {

        const belongsToCompany = await this.ucgEntity
            .createQueryBuilder('ucg')
            .where('ucg.userId = :userId', { userId: params.userId })
            .andWhere('ucg.companyId IN (:...companyIds)', { companyIds: req.scopedCompanyIds })
            .getOne();

        if (!belongsToCompany) {
            return { success: 0, message: 'Access denied: user not in your company' };
        }
    }

    const res = await this.updateUser(params, userFile);
    if (res.success === 1) return this.updateSuccess(res, params);
    return this.finishFailure(res);
}
    async updateUser(params: any, userFile?: any) {
        if (!params.userId) {
            return { success: 0, message: 'userId is mandatory' };
        }

        try {
            const user = await this.userEntity.findOne({
                where: { userId: params.userId },
            });

            if (!user) {
                return { success: 0, message: 'User not found' };
            }

            if (params.name)           user.name           = params.name;
            if (params.email)          user.email          = params.email;
            if (params.age)            user.age            = params.age;
            if (params.phone)          user.phone          = params.phone;
            if (params.status)         user.status         = params.status;
            if (userFile)              user.userFile       = userFile.filename;
            if (params.country)        user.country        = params.country;
            if (params.state)          user.state          = params.state;
            if (params.postalCode)     user.postalCode     = Number(params.postalCode);
            if (params.AddressLineOne) user.AddressLineOne = params.AddressLineOne;
            if (params.alternatePhone) user.alternatePhone = params.alternatePhone;
            
            user.updatedDate = new Date();

            await this.userEntity.save(user);

            if (params.companyId && params.groupId) {
                await this.saveAssignments(
                    params.userId,
                    [{
                        companyId: params.companyId,
                        groupId:   params.groupId,
                        is_parent: params.is_parent ?? undefined,
                    }],
                    true, 
                );
            }

            if (userFile) {
                await this.fileTransfer.fileTransfer(
                    userFile.filename,
                    params.userId,
                    params.userId,
                );
            }

            return {
                success: 1,
                message: 'Updated successfully',
                data: { affected: 1 },
            };
        } catch (err: any) {
            return {
                success: 0,
                message: err instanceof Error ? err.message : 'An unexpected error occurred',
            };
        }
    }

    async updateSuccess(result: any, params: any) {
        return { status: result, data: params.affected };
    }

    async login(body: any) {
        try {
            if (!body.email || !body.password) {
                return { success: 0, message: 'Email and password are required' };
            }

        const user = await this.userEntity
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userCompanyGroups', 'ucg')
            .leftJoinAndSelect('ucg.company', 'company')
            .leftJoinAndSelect('ucg.group', 'group')
            .where('user.email = :email', { email: body.email })
            .getOne();
            // console.log(user,"####################### user login")
            if (!user) {    
                return { success: 0, message: 'Enter valid Email and password' };
            }
            const isMatch = await bcrypt.compare(
                body.password,
                user.password,
            );

            // console.log(isMatch,"############################### is match login")
            if (!isMatch) {
                return { success: 0, message: 'Enter valid Email and password' };
            }

            // const isSuperAdmin = user.userCompanyGroups?.some(
            //     (ucg) => ucg.group?.groupName === 'superAdmin',
            // );

            const payload = {
                userId: user.userId,
                email: user.email,
            };

            const token = this.jwtService.sign({ userId: user.userId, email: user.email });
            const primary = user.userCompanyGroups?.[0];
            const groupId = primary?.groupId;

            const groupPerms = groupId
                ? await this.groupPermissionEntity.find({
                    where: { groupId },
                    relations: ['permission'],
                })
                : [];

            const permissions = groupPerms.map((gp) => gp.permission?.permissionName).filter(Boolean);

            return {
                success: 1,
                message: 'success',
                token,
                accessToken: token,
                user: {
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    primaryProfile: primary ? {
                        companyName: primary.company?.companyName,
                        groupName: primary.group?.groupName,
                        is_parent: primary.is_parent,
                    } : null,
                    permissions,
                },
            };
        } catch (error: any) {
            return {
                success: 0,
                message: 'Something went wrong',
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    }

async getUsers(param: any, req?: any) {
    let return_data: any = {};
    try {
        let queryBuilder = this.userEntity
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userCompanyGroups', 'ucg')
            .leftJoinAndSelect('ucg.company', 'company')
            .leftJoinAndSelect('ucg.group', 'group');

        if (req?.scopedCompanyIds?.length) {
            queryBuilder.andWhere('ucg.companyId IN (:...companyIds)', {
                companyIds: req.scopedCompanyIds,
            });
        }

        const queryString = await this.filter.makeFilterString(param?.filters, 'user');
        if (queryString && queryString !== '') queryBuilder.andWhere(queryString);

        const [skip, limit] = (await this.filter.calcPages(param, this.userEntity)) as [number, number];
        queryBuilder.skip(skip).take(limit);

        const data = await queryBuilder.getMany();
        const total = await this.userEntity.count();

        const formattedData = data.map((user) => {
            const allAssignments = user.userCompanyGroups ?? [];

            // Primary = is_parent=0, fallback to first
            const primary =
                allAssignments.find((u) => u.is_parent === 0) ??
                allAssignments[0] ??
                null;

            return {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                userFile: user.userFile,
                age: user.age,
                // Single primary assignment shown in list view
                assignments: primary ? [{
                    id: primary.id,
                    companyId: primary.companyId,
                    companyName: primary.company?.companyName,
                    groupId: primary.groupId,
                    groupName: primary.group?.groupName,
                    is_parent: primary.is_parent,
                }] : [],
            };
        });

        return_data = { success: 1, message: 'List fetched successfully', total, data: formattedData };
    } catch (err: any) {
        return_data = { success: 0, message: err.message };
    }
    return return_data;
}
async getUser(query: any, req?: any) {
    try {
        const targetId = Number(query.id ?? query);
        const profileId = query.profileId ? Number(query.profileId) : null;

        const user = await this.userEntity.findOne({
            where: { userId: targetId },
            relations: ['userCompanyGroups', 'userCompanyGroups.company', 'userCompanyGroups.group'],
        });

        if (!user) return { success: 0, message: 'User not found' };

        const [createdByUser, updatedByUser] = await Promise.all([
            user.createdBy ? this.userEntity.findOne({ where: { userId: user.createdBy }, select: ['name'] }) : null,
            user.updatedBy ? this.userEntity.findOne({ where: { userId: user.updatedBy }, select: ['name'] }) : null,
        ]);

        const allAssignments = user.userCompanyGroups ?? [];

        const activeAssignment = profileId != null
            ? (allAssignments.find((u) => u.id === profileId) ?? null)
            : (allAssignments.find((u) => u.is_parent === 0) ?? allAssignments[0] ?? null);

        const mapAssignment = (ucg: any) => ({
            id: ucg.id,
            companyId: ucg.companyId,
            companyName: ucg.company?.companyName ?? null,
            groupId: ucg.groupId,
            groupName: ucg.group?.groupName ?? null,
            is_parent: ucg.is_parent,
        });

        const primary =
    allAssignments.find((u) => u.is_parent === 0) ??
    allAssignments[0] ??
    null;

        return {
            userId: user.userId,
            name: user.name,
            email: user.email,
            age: user.age,
            phone: user.phone,
            status: user.status,
            createdBy: createdByUser?.name ?? null,
            updatedBy: updatedByUser?.name ?? null,
            userFile: user.userFile,
            createdAt: user.createdAt,
            updatedDate: user.updatedDate,
            primaryProfile: primary ? {
                companyName: primary.company?.companyName ?? null,
                groupName: primary.group?.groupName ?? null,
                is_parent: primary.is_parent,
            } : null,
            activeAssignment: activeAssignment ? mapAssignment(activeAssignment) : null,
            assignments: allAssignments.map(mapAssignment),
        };
    } catch (err: any) {
        return { success: 0, message: err.message };
    }
}

    async startChangePass(body: any) {
        try {
            if (!body.email || !body.password || !body.newpass || !body.confirmpass) {
                return { success: 0, message: 'Required fields missing' };
            }
            if (body.newpass !== body.confirmpass) {
                return { success: 0, message: 'Password mismatch' };
            }
            const user = await this.userEntity.findOne({ where: { email: body.email } });
            if (!user) return { success: 0, message: 'User not found' };

            const [isMatch, isSame] = await Promise.all([
                bcrypt.compare(body.password, user.password),
                bcrypt.compare(body.newpass, user.password),
            ]);
            if (!isMatch) return { success: 0, message: 'Current password is incorrect' };
            if (isSame) return { success: 0, message: 'New password should not be same as old password' };

            await this.userEntity.update(
                { userId: user.userId },
                { password: await bcrypt.hash(body.newpass, 10) },
            );
            return { success: 1, message: 'Password updated successfully' };
        } catch (error) {
            return { success: 0, message: 'Something went wrong', error };
        }
    }

    async startForgotPass(body: any) {
        try {
            if (!body.email) return { success: 0, message: 'Email required' };

            const user = await this.userEntity.findOne({ where: { email: body.email } });
            if (!user) return { success: 0, message: 'Enter valid Email' };
            if (user.email === 'admin@gmail.com') return { success: 0, message: 'Cannot edit admin' };

            const res = await this.mailer.sendMail(body.email);
            if (res) {
                const token = Math.random().toString(36).substring(2, 15);
                await this.userEntity.update({ userId: user.userId }, { otp: res, token });
                return { success: 1, message: 'OTP sent successfully' };
            }
        } catch (error) {
            return { success: 0, error };
        }
    }

    async confirmOtp(body: any) {
        try {
            if (!body) return { success: 0, message: 'Something went wrong' };

            const res = await this.userEntity.findOne({
                where: { email: body.email, otp: body.otp },
            });

            if (res?.otp == body.otp) {
                return { success: 1, message: 'OTP verification successful', token: res?.token };
            }
            return { success: 0, message: 'OTP verification failed' };
        } catch {
            return { success: 0, message: 'Something went wrong' };
        }
    }

    async startResetPass(body: any) {
        try {
            if (!body.token || !body.password || !body.confirmPass) {
                return {
                    success: 0,
                    message: 'Token, password, and confirm password are required',
                };
            }

            const user = await this.userEntity.findOne({ where: { token: body.token } });
            if (!user) return { success: 0, message: 'Something went wrong' };
            if (body.password != body.confirmPass) return { success: 0, message: 'Password mismatch' };

            await this.userEntity.update(
                { token: body.token },
                { password: await bcrypt.hash(body.password, 10) },
            );

            return { success: 1, message: 'Password updated successfully' };
        } catch (error: any) {
            return {
                success: 0,
                message: 'Something went wrong',
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    }

    async checkPassword(body: { email: string; password: string }) {
        try {
            const user = await this.userEntity.findOne({ where: { email: body.email } });
            if (!user) return { success: 0, message: 'User not found' };

            const isMatch = await bcrypt.compare(body.password, user.password);
            if (!isMatch) return { success: 0, message: 'Current password is incorrect' };

            return { success: 1, message: 'Password verified' };
        } catch {
            return { success: 0, message: 'Something went wrong' };
        }
    }
    async verifyPassword(body: any) {
        try {
            const user = await this.userEntity.findOne({ where: { email: body.email } });
            if (!user) return { success: 0, message: 'User not found' };
            const isMatch = await bcrypt.compare(body.password, user.password);
            return isMatch
                ? { success: 1, message: 'Password matched successfully', isMatch }
                : { success: 0, message: 'Password mismatch', isMatch };
        } catch {
            return { success: 0, message: 'Something went wrong' };
        }
    }

    async addProfile(body: { userId: number; groupId: number; companyId: number; isActive: string }) {
    try {
        const { userId, groupId, companyId, isActive } = body;
        if (!userId || !groupId || !companyId) {
            return { success: 0, message: 'userId, groupId and companyId are required' };
        }

        const existing = await this.ucgEntity.findOne({
            where: { userId: Number(userId), groupId: Number(groupId), companyId: Number(companyId) },
        });
        if (existing) {
            return { success: 0, message: 'This profile combination already exiszts' };
        }

        const row = this.ucgEntity.create({
            userId: Number(userId),
            groupId: Number(groupId),
            companyId: Number(companyId),
            is_parent: Number(userId), 
        });
        await this.ucgEntity.save(row); 
        return { success: 1, message: 'Profile added successfully' };
    } catch (err: any) {
        return { success: 0, message: err.message };
    }
}

async loginAs(targetUserId: number, requestingUserId: number) {
    try {
        const requester = await this.userEntity.findOne({
            where: { userId: requestingUserId },
            relations: ['userCompanyGroups', 'userCompanyGroups.group'],
        });

        const isSuperAdmin = requester?.userCompanyGroups?.some(
            (ucg) => ucg.group?.groupName === 'superAdmin'
        );
        if (!isSuperAdmin) {
            return { success: 0, message: 'Only superAdmin can use login as' };
        }

        const target = await this.userEntity
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userCompanyGroups', 'ucg')
            .leftJoinAndSelect('ucg.company', 'company')
            .leftJoinAndSelect('ucg.group', 'group')
            .where('user.userId = :userId', { userId: targetUserId })
            .getOne();

        if (!target) return { success: 0, message: 'Target user not found' };

        const primary =
            target.userCompanyGroups?.find((u) => u.is_parent === 0) ??
            target.userCompanyGroups?.[0] ??
            null;

        const groupId = primary?.groupId;

        const groupPerms = groupId
            ? await this.groupPermissionEntity.find({
                where: { groupId },
                relations: ['permission'],
            })
            : [];

        const permissions = groupPerms
            .map((gp) => gp.permission?.permissionName)
            .filter(Boolean);

        const impersonationToken = this.jwtService.sign({
            userId: target.userId,
            email: target.email,
            impersonatedBy: requestingUserId,
            isImpersonation: true,
        });

        return {
        success: 1,
        impersonationToken,
        user: {
            userId: target.userId,
            name: target.name,
            email: target.email,
            primaryProfile: primary ? {
                companyName: primary.company?.companyName,
                groupName: primary.group?.groupName,
                is_parent: primary.is_parent,
            } : null,
            permissions,
        },
    };
    } catch (err: any) {
        return { success: 0, message: err.message };
    }
}

}