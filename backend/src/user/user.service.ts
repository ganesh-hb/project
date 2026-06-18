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

    
    //  Load a user with all their company+group assignments (with joined relations).
     
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
        const assignment = await this.ucgEntity.findOne({
            where: {
                userId: params.userId,
            },
        });

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

            if (params.name)   user.name   = params.name;
            if (params.email)  user.email  = params.email;
            if (params.age)    user.age    = params.age;
            if (params.phone)  user.phone  = params.phone;
            if (params.status) user.status = params.status;
            if (userFile)      user.userFile = userFile.filename;
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
            .leftJoinAndSelect(
                'user.userCompanyGroups',
                'ucg',
                'ucg.is_parent = :isParent',
                { isParent: 0 },
            )
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

            const isSuperAdmin = user.userCompanyGroups?.some(
                (ucg) => ucg.group?.groupName === 'superAdmin',
            );

            const payload = {
                userId: user.userId,
                email: user.email,
            };

            const token = this.jwtService.sign(payload);

            return {
                success: 1,
                message: 'success',
                token,
                accessToken: token, 
                user: {
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    groupName: user.userCompanyGroups?.map((ucg) => ucg.group?.groupName).filter(Boolean),
                    assignments: user.userCompanyGroups?.map((ucg) => ({
                        companyId: ucg.companyId,
                        companyName: ucg.company?.companyName,
                        groupId: ucg.groupId,
                        groupName: ucg.group?.groupName,
                        is_parent: ucg.is_parent,
                    })),
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

        const alias = 'user';
        const queryString = await this.filter.makeFilterString(param?.filters, alias);
        if (queryString && queryString !== '') queryBuilder.andWhere(queryString);

        const [skip, limit] = (await this.filter.calcPages(param, this.userEntity)) as [number, number];
        queryBuilder.skip(skip).take(limit);

        const data = await queryBuilder.getMany();

        const formattedData = data.map((user) => ({
            ...user,
            assignments: user.userCompanyGroups?.map((ucg) => ({
                companyId: ucg.companyId,
                companyName: ucg.company?.companyName,
                groupId: ucg.groupId,
                groupName: ucg.group?.groupName,
                is_parent: ucg.is_parent,
            })),
        }));

        return_data = { success: 1, message: 'List fetched successfully', data: formattedData };
    } catch (err: any) {
        return_data = { success: 0, message: err.message };
    }

    return return_data;
}

   async getUser(query: any, req?: any) {
    try {
        const targetId = Number(query);
        const isCustomer = req?.userRoles?.includes('customer') && !req?.isSuperAdmin;

        // customer can only view their own profile
        if (isCustomer && req.user.userId !== targetId) {
            return { success: 0, message: 'Access denied' };
        }

        const user = await this.loadUserWithAssignments(targetId);
        if (!user) throw new NotFoundException('User not found');

        const createdByUser = await this.userEntity.findOne({ where: { userId: user.createdBy } });
        const updatedByUser = await this.userEntity.findOne({ where: { userId: user.updatedBy } });

        return {
            userId: user.userId,
            name: user.name,
            email: user.email,
            age: user.age,
            phone: user.phone,
            status: user.status,
            createdBy: createdByUser?.name,
            updatedBy: updatedByUser?.name,
            userFile: user.userFile,
            createdAt: user.createdAt,
            updatedDate: user.updatedDate,
            assignments: user.userCompanyGroups?.map((ucg) => ({
                id: ucg.id,
                companyId: ucg.companyId,
                companyName: ucg.company?.companyName,
                groupId: ucg.groupId,
                groupName: ucg.group?.groupName,
                is_parent: ucg.is_parent,
            })),
        };
    } catch (err) {
        return err;
    }
}

    async startChangePass(body: any) {
        try {
            if (!body.email || !body.password || !body.newpass || !body.confirmpass) {
                return { success: 0, message: 'Required fields missing' };
            }

            const user = await this.userEntity.findOne({
                where: { email: body.email },
            });

            if (!user) return { success: 0, message: 'User not found' };

            const isMatch = await bcrypt.compare(body.password, user.password);
            if (!isMatch) return { success: 0, message: 'Current password is incorrect' };

            if (body.newpass !== body.confirmpass) {
                return { success: 0, message: 'Password mismatch' };
            }

            const samePassword = await bcrypt.compare(body.newpass, user.password);
            if (samePassword) {
                return { success: 0, message: 'New password should not be same as old password' };
            }

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
            const isMatch = await bcrypt.compare(body.password, user!.password);
            return isMatch
                ? { success: 1, message: 'Password matched successfully', isMatch }
                : { success: 0, message: 'Password mismatch', isMatch };
        } catch {
            return { success: 0, message: 'Something went wrong' };
        }
    }
}