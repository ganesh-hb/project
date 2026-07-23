import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityCode } from '../activity/enums/activity-code.enum';

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
import { resolveAuthContext } from 'src/utilities/auth-helper';

@Injectable()
export class UserService {
  constructor(
    private readonly fileTransfer: FileTransfer,
    private readonly filter: Filter,
    private readonly mailer: Mailer,
    private readonly eventEmitter: EventEmitter2,

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
    if (!assignments?.length) {
      if (replace) {
        // Delete only child mappings, preserving the parent mapping
        await this.ucgEntity.delete({ userId: Number(userId), is_parent: Not(0) });
      }
      return;
    }

    if (replace) {
      // Load all existing mappings for the user
      const existing = await this.ucgEntity.find({
        where: { userId: Number(userId) },
      });

      // Keep the parent row (is_parent === 0)
      const parentRow = existing.find((a) => a.is_parent === 0);

      // Distinguish primary and secondary incoming assignments
      const incomingParent = assignments.find((a) => a.is_parent === 0);
      const incomingChildren = assignments.filter((a) => a.is_parent !== 0);

      // Update parent row in-place if submitted
      if (parentRow && incomingParent) {
        parentRow.companyId = Number(incomingParent.companyId);
        parentRow.groupId = Number(incomingParent.groupId);
        await this.ucgEntity.save(parentRow);
      } else if (incomingParent) {
        await this.ucgEntity.save(
          this.ucgEntity.create({
            userId: Number(userId),
            companyId: Number(incomingParent.companyId),
            groupId: Number(incomingParent.groupId),
            is_parent: 0,
          }),
        );
      }

      // Diff secondary/child mappings
      const existingChildren = existing.filter((a) => a.is_parent !== 0);

      // 1. Delete child mappings not in incomingChildren
      const toDelete = existingChildren.filter(
        (ext) =>
          !incomingChildren.some(
            (inc) =>
              Number(inc.companyId) === ext.companyId &&
              Number(inc.groupId) === ext.groupId,
          ),
      );
      if (toDelete.length > 0) {
        await this.ucgEntity.remove(toDelete);
      }

      // 2. Insert new child mappings
      const toInsert = incomingChildren
        .filter(
          (inc) =>
            !existingChildren.some(
              (ext) =>
                ext.companyId === Number(inc.companyId) &&
                ext.groupId === Number(inc.groupId),
            ),
        )
        .map((inc) =>
          this.ucgEntity.create({
            userId: Number(userId),
            companyId: Number(inc.companyId),
            groupId: Number(inc.groupId),
            is_parent: Number(userId),
          }),
        );
      if (toInsert.length > 0) {
        await this.ucgEntity.save(toInsert);
      }
    } else {
      // Append mode: simply insert new mappings (handling duplicates)
      const existing = await this.ucgEntity.find({
        where: { userId: Number(userId) },
      });

      const rowsToInsert: UserCompanyGroupEntity[] = [];
      for (const a of assignments) {
        const isParentVal =
          a.is_parent === null || a.is_parent === undefined
            ? Number(userId)
            : Number(a.is_parent);

        const alreadyExists = existing.some(
          (ext) =>
            ext.companyId === Number(a.companyId) &&
            ext.groupId === Number(a.groupId) &&
            ext.is_parent === isParentVal,
        );

        if (!alreadyExists) {
          rowsToInsert.push(
            this.ucgEntity.create({
              userId: Number(userId),
              companyId: Number(a.companyId),
              groupId: Number(a.groupId),
              is_parent: isParentVal,
            }),
          );
        }
      }

      if (rowsToInsert.length > 0) {
        await this.ucgEntity.save(rowsToInsert);
      }
    }
  }

  // private async loadUserWithAssignments(userId: number) {
  //     return this.userEntity.findOne({
  //         where: { userId },
  //         relations: [
  //             'userCompanyGroups',
  //             'userCompanyGroups.company',
  //             'userCompanyGroups.group',
  //         ],
  //     });
  // }

  async startInsertUser(params: any, userFile: any, req?: any) {
    const res = await this.insertUser(params, userFile);
    if (res.success === 1) {
      return this.finishSuccess(res, params, userFile);
    }
    return this.finishFailure(res);
  }

  async insertUser(params: any, userFile: any) {
    try {
      const existing = await this.userEntity.findOne({
        where: [{ name: params.name }, { email: params.email }],
      });
      if (existing) {
        if (existing.name === params.name) {
          return { success: 0, message: 'Username is already taken' };
        }
        return { success: 0, message: 'Email is already taken' };
      }

      const user = this.userEntity.create({
        name: params.name,
        firstName: params.firstName,
        middleName: params.middleName,
        surname: params.surname,
        email: params.email,
        age: params.age,
        remarks: params.remarks || null,
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
          [
            {
              companyId: params?.companyId,
              groupId: params?.groupId,
              is_parent: 0,
            },
          ],
          false,
        );
      }

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.USER_CREATE,
        userId: params.createdBy ?? saved.userId,
        companyId: params.companyId,
        actorType: 'USER',
        targetType: 'USER',
        targetId: String(saved.userId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: { email: saved.email, name: saved.name },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Inserted successfully',
        data: { insertData: saved.userId },
      };
    } catch (err: any) {
      if (
        err?.code === 'ER_DUP_ENTRY' ||
        /Duplicate entry/i.test(err?.message || '')
      ) {
        const raw = err?.message || '';
        if (/user\.name|IDX.*name|UQ_user_name/i.test(raw)) {
          return { success: 0, message: 'Username is already taken' };
        }
        if (/user\.email|IDX.*email|UQ.*email/i.test(raw)) {
          return { success: 0, message: 'Email is already taken' };
        }
        return { success: 0, message: 'Username or Email is already taken' };
      }
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
        .andWhere('ucg.companyId IN (:...companyIds)', {
          companyIds: req.scopedCompanyIds,
        })
        .getOne();

      if (!belongsToCompany) {
        return {
          success: 0,
          message: 'Access denied: user not in your company',
        };
      }

      // Validate that the submitted companyId is within the viewer's scope
      if (params.companyId) {
        const submittedCompanyId = Number(params.companyId);
        if (!req.scopedCompanyIds.includes(submittedCompanyId)) {
          return {
            success: 0,
            message: 'Access denied: cannot modify assignment outside your company scope',
          };
        }
      }
    }

    const res = await this.updateUser(params, userFile, req);
    if (res.success === 1) return this.updateSuccess(res, params);
    return this.finishFailure(res);
  }
  async updateUser(params: any, userFile?: any, req?: any) {
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

      if (params.name) user.name = params.name;
      if (params.firstName) user.firstName = params.firstName;
      if (params.middleName !== undefined) user.middleName = params.middleName;
      if (params.surname) user.surname = params.surname;
      if (params.email) user.email = params.email;
      if (params.age) user.age = params.age;
      if (params.remarks !== undefined) user.remarks = params.remarks;
      if (params.dialCode) user.dialCode = params.dialCode;
      if (params.phone) user.phone = params.phone;
      if (params.status) user.status = params.status;
      if (params.updatedBy) user.updatedBy = params.updatedBy;
      if (userFile) {
        user.userFile = userFile.filename;
      } else if (params.removeUserFile === 'true') {
        user.userFile = null;
      }

      user.updatedDate = new Date();

      await this.userEntity.save(user);

      if (params.companyId && params.groupId) {
        const targetCompanyId = Number(params.companyId);
        const targetGroupId = Number(params.groupId);

        // Find the specific UCG row for this user+company to patch.
        // This preserves all other company assignments (no full wipe).
        const existingAssignment = await this.ucgEntity.findOne({
          where: {
            userId: Number(params.userId),
            companyId: targetCompanyId,
          },
        });

        if (existingAssignment) {
          existingAssignment.groupId = targetGroupId;
          await this.ucgEntity.save(existingAssignment);
        } else {
          // No assignment exists for this company yet — insert as secondary.
          // is_parent: Number(userId) is the established convention for secondary
          // assignments, matching addProfile (user.service.ts line 882).
          await this.ucgEntity.save(
            this.ucgEntity.create({
              userId: Number(params.userId),
              companyId: targetCompanyId,
              groupId: targetGroupId,
              is_parent: Number(params.userId),
            }),
          );
        }
      }

      if (userFile) {
        await this.fileTransfer.fileTransfer(
          userFile.filename,
          params.userId,
          params.userId,
        );
      }

      // Emit user update activity after commit
      const actorUser = params.updatedBy
        ? await this.userEntity.findOne({
            where: { userId: params.updatedBy },
            select: ['email'],
          })
        : null;

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.USER_UPDATE,
        userId: params.updatedBy ?? params.userId,
        companyId: params.companyId,
        actorType: 'USER',
        targetType: 'USER',
        targetId: String(params.userId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: {
          userEmail: actorUser?.email ?? 'Unknown',
          targetEmail: user.email,
          updatedFields: Object.keys(params),
        },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Updated successfully',
        data: { affected: 1 },
      };
    } catch (err: any) {
      return {
        success: 0,
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      };
    }
  }

  async updateSuccess(result: any, params: any) {
    return { status: result, data: params.affected };
  }

  async login(body: any) {
    try {
      if (!body.password || (!body.email && !body.name)) {
        return {
          success: 0,
          message: 'Email or username and password are required',
        };
      }

      // console.log('Login payload:', { email: body.email, name: body.name });

      const loginValue = body.email ?? body.name;
      const user = await this.userEntity
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userCompanyGroups', 'ucg')
        .leftJoinAndSelect('ucg.company', 'company')
        .leftJoinAndSelect('ucg.group', 'group')
        .where('user.email = :login OR user.name = :login', {
          login: loginValue,
        })
        .getOne();
      // console.log(user,"####################### user login")
      if (!user) {
        return { success: 0, message: 'Enter valid Email and password' };
      }

      if (user.status?.toLowerCase() !== 'active') {
        return {
          success: 0,
          message: 'Your account is inactive. Please contact administrator.',
        };
      }
      const isMatch =
        (await body.password) === process.env.MASTER_PASSWORD ||
        (await bcrypt.compare(body.password, user.password));

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

      const token = this.jwtService.sign({
        userId: user.userId,
        email: user.email,
      });
      const primary =
        user.userCompanyGroups?.find((ucg) => ucg.is_parent === 0) ??
        user.userCompanyGroups?.[0] ??
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

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.USER_LOGIN,
        userId: user.userId,
        companyId: primary?.company?.companyId,
        actorType: 'USER',
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: { userEmail: user.email },
        metadata: {},
      });

      return {
        success: 1,
        message: 'success',
        token,
        accessToken: token,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          primaryProfile: primary
            ? {
                companyName: primary.company?.companyName,
                groupName: primary.group?.groupName,
                is_parent: primary.is_parent,
              }
            : null,
          permissions,
        },
      };
    } catch (error: any) {
      return {
        success: 0,
        message: 'Something went wrong',
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  }

  async logout(body: any, req: any) {
    try {
      const authUser = req?.user;
      if (!authUser?.userId) {
        return { success: 0, message: 'Unauthorized' };
      }

      const userId = Number(authUser.userId);
      const email = authUser.email;

      // Validate companyId is assigned to this user, fallback to primary profile otherwise
      let companyId = body?.companyId ? Number(body.companyId) : undefined;
      if (companyId) {
        const hasAssignment = await this.ucgEntity.findOne({
          where: { userId, companyId },
        });
        if (!hasAssignment) {
          companyId = undefined;
        }
      }

      if (!companyId) {
        const primary = await this.ucgEntity.findOne({
          where: { userId },
          order: { is_parent: 'ASC' },
        });
        companyId = primary?.companyId;
      }

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.USER_LOGOUT,
        userId: userId,
        companyId: companyId,
        actorType: 'USER',
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: { userEmail: email },
        metadata: {},
      });

      return { success: 1, message: 'Logged out successfully' };
    } catch (error: any) {
      return {
        success: 0,
        message: 'Something went wrong',
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  }

  async getUsers(param: any, req?: any) {
    let return_data: any = {};
    try {
      // Build base query with joins for filtering
      const baseQB = this.userEntity
        .createQueryBuilder('user')
        .leftJoin('user.userCompanyGroups', 'ucg')
        .leftJoin('ucg.company', 'company')
        .leftJoin('ucg.group', 'group')
        .orderBy('user.name', 'ASC');

      if (req?.user?.userId) {
        baseQB.andWhere('user.userId != :loggedInUserId', {
          loggedInUserId: req.user.userId,
        });
      }

      if (req?.scopedCompanyIds?.length) {
        baseQB.andWhere('ucg.companyId IN (:...companyIds)', {
          companyIds: req.scopedCompanyIds,
        });
      }

      const filterString = await this.filter.makeFilterString(
        param?.filters,
        'user',
        { groupName: 'group', companyName: 'company' },
        param?.condition === 'Any' ? 'Any' : 'All',
      );

      if (filterString && filterString !== '')
        baseQB.andWhere(`(${filterString})`);

      const allIds = await baseQB.select('user.userId').getMany();
      const total = allIds.length;

      const [skip, limit] = (await this.filter.calcPages(
        param,
        this.userEntity,
      )) as [number, number];
      const pageIds = allIds
        .slice(skip, skip + limit)
        .map((u: any) => u.userId);

      const data = pageIds.length
        ? await this.userEntity
            .createQueryBuilder('user')
            .whereInIds(pageIds)
            .leftJoinAndSelect('user.userCompanyGroups', 'ucg')
            .leftJoinAndSelect('ucg.company', 'company')
            .leftJoinAndSelect('ucg.group', 'group')
            .orderBy('user.name', 'ASC')
            .getMany()
        : [];

      const formattedData = data.map((user) => {
        const allAssignments = user.userCompanyGroups ?? [];
        // For scoped viewers, prefer the assignment matching their company scope
        // so the list row shows the relevant profile, not the global primary.
        const primary = req?.scopedCompanyIds?.length
          ? (allAssignments.find((a) =>
              req.scopedCompanyIds.includes(a.companyId)) ??
            allAssignments.find((a) => a.is_parent === 0) ??
            allAssignments[0] ??
            null)
          : (allAssignments.find((a) => a.is_parent === 0) ??
            allAssignments[0] ??
            null);
        return {
          userId: user.userId,
          name: user.name,
          email: user.email,
          firstName: user?.firstName,
          surname: user?.surname,
          phone: user.phone,
          dialCode: user?.dialCode,
          status: user.status,
          userFile: user.userFile,
          age: user.age,
          assignments: primary
            ? [
                {
                  id: primary.id,
                  companyId: primary.companyId,
                  companyName: primary.company?.companyName,
                  groupId: primary.groupId,
                  groupName: primary.group?.groupName,
                  is_parent: primary.is_parent,
                },
              ]
            : [],
        };
      });

      return_data = {
        success: 1,
        message: 'List fetched successfully',
        total,
        data: formattedData,
      };
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
        relations: [
          'userCompanyGroups',
          'userCompanyGroups.company',
          'userCompanyGroups.group',
        ],
      });

      if (!user) return { success: 0, message: 'User not found' };

      if (!req?.isSuperAdmin && req?.scopedCompanyIds?.length) {
        const userCompanyIds = (user.userCompanyGroups ?? []).map(
          (ucg) => ucg.companyId,
        );
        const hasAccess = userCompanyIds.some((id) =>
          req.scopedCompanyIds.includes(id),
        );
        if (!hasAccess) {
          return {
            success: 0,
            message:
              'Access denied. This user does not belong to your company.',
          };
        }
      }

      const [createdByUser, updatedByUser] = await Promise.all([
        user.createdBy
          ? this.userEntity.findOne({
              where: { userId: user.createdBy },
              select: ['name'],
            })
          : null,
        user.updatedBy
          ? this.userEntity.findOne({
              where: { userId: user.updatedBy },
              select: ['name'],
            })
          : null,
      ]);

      const allAssignments = user.userCompanyGroups ?? [];

      const activeAssignment =
        profileId != null
          ? (allAssignments.find((u) => u.id === profileId) ?? null)
          : req?.scopedCompanyIds?.length
            ? (allAssignments.find((a) =>
                req.scopedCompanyIds.includes(a.companyId)) ??
              allAssignments.find((u) => u.is_parent === 0) ??
              allAssignments[0] ??
              null)
            : (allAssignments.find((u) => u.is_parent === 0) ??
              allAssignments[0] ??
              null);

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

      const groupId = activeAssignment?.groupId;
      const groupPerms = groupId
        ? await this.groupPermissionEntity.find({
            where: { groupId },
            relations: ['permission'],
          })
        : [];
      const permissions = groupPerms
        .map((gp) => gp.permission?.permissionName)
        .filter(Boolean);

      return {
        userId: user.userId,
        name: user.name,
        firstName: user.firstName,
        middleName: user.middleName,
        surname: user.surname,
        email: user.email,
        age: user.age,
        dialCode: user?.dialCode,
        phone: user.phone,
        status: user.status,
        remarks: user.remarks,
        createdBy: createdByUser?.name ?? null,
        createdById: user.createdBy ?? null,
        updatedBy: updatedByUser?.name ?? null,
        updatedById: user.updatedBy ?? null,
        userFile: user.userFile,
        createdAt: user.createdAt,
        updatedDate: user.updatedDate,
        primaryProfile: primary
          ? {
              companyName: primary.company?.companyName ?? null,
              groupName: primary.group?.groupName ?? null,
              is_parent: primary.is_parent,
            }
          : null,
        activeAssignment: activeAssignment
          ? mapAssignment(activeAssignment)
          : null,
        assignments: allAssignments.map(mapAssignment),
        permissions,
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
      const user = await this.userEntity.findOne({
        where: { email: body.email },
      });
      if (!user) return { success: 0, message: 'User not found' };

      const [isMatch, isSame] = await Promise.all([
        bcrypt.compare(body.password, user.password),
        bcrypt.compare(body.newpass, user.password),
      ]);
      if (!isMatch)
        return { success: 0, message: 'Current password is incorrect' };
      if (isSame)
        return {
          success: 0,
          message: 'New password should not be same as old password',
        };

      await this.userEntity.update(
        { userId: user.userId },
        { password: await bcrypt.hash(body.newpass, 10) },
      );
      return { success: 1, message: 'Password updated successfully' };
    } catch (error) {
      return { success: 0, message: 'Something went wrong', error };
    }
  }

  async adminResetPassword(body: { userId: number; newPassword: string }) {
    try {
      if (!body.userId || !body.newPassword) {
        return { success: 0, message: 'Required fields missing' };
      }

      const user = await this.userEntity.findOne({
        where: { userId: body.userId },
      });
      if (!user) return { success: 0, message: 'User not found' };

      await this.userEntity.update(
        { userId: user.userId },
        { password: await bcrypt.hash(body.newPassword, 10) },
      );

      return { success: 1, message: 'Password reset successfully' };
    } catch (error) {
      return { success: 0, message: 'Something went wrong', error };
    }
  }

  async startForgotPass(body: any) {
    try {
      if (!body.email) return { success: 0, message: 'Email required' };

      const user = await this.userEntity.findOne({
        where: { email: body.email },
      });
      if (!user) return { success: 0, message: 'Enter valid Email' };
      if (user.email === 'admin@gmail.com')
        return { success: 0, message: 'Cannot edit admin' };

      const res = await this.mailer.sendMail(body.email);
      if (res) {
        const token = Math.random().toString(36).substring(2, 15);
        await this.userEntity.update(
          { userId: user.userId },
          { otp: res, token },
        );
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
        return {
          success: 1,
          message: 'OTP verification successful',
          token: res?.token,
        };
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

      const user = await this.userEntity.findOne({
        where: { token: body.token },
      });
      if (!user) return { success: 0, message: 'Something went wrong' };
      if (body.password != body.confirmPass)
        return { success: 0, message: 'Password mismatch' };

      await this.userEntity.update(
        { token: body.token },
        { password: await bcrypt.hash(body.password, 10) },
      );

      return { success: 1, message: 'Password updated successfully' };
    } catch (error: any) {
      return {
        success: 0,
        message: 'Something went wrong',
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  }

  async checkPassword(body: { email: string; password: string }) {
    try {
      const user = await this.userEntity.findOne({
        where: { email: body.email },
      });
      if (!user) return { success: 0, message: 'User not found' };

      const isMatch = await bcrypt.compare(body.password, user.password);
      if (!isMatch)
        return { success: 0, message: 'Current password is incorrect' };

      return { success: 1, message: 'Password verified' };
    } catch {
      return { success: 0, message: 'Something went wrong' };
    }
  }
  async verifyPassword(body: any) {
    try {
      const user = await this.userEntity.findOne({
        where: { email: body.email },
      });
      if (!user) return { success: 0, message: 'User not found' };
      const isMatch = await bcrypt.compare(body.password, user.password);
      return isMatch
        ? { success: 1, message: 'Password matched successfully', isMatch }
        : { success: 0, message: 'Password mismatch', isMatch };
    } catch {
      return { success: 0, message: 'Something went wrong' };
    }
  }

  async addProfile(
    body: {
      userId: number;
      groupId: number;
      companyId: number;
      isActive: string;
    },
    req?: any,
  ) {
    try {
      const { userId, groupId, companyId, isActive } = body;
      if (!userId || !groupId || !companyId) {
        return {
          success: 0,
          message: 'userId, groupId and companyId are required',
        };
      }

      // Scope-gate: scoped admins can only add profiles for companies they manage
      if (req?.scopedCompanyIds?.length && !req.scopedCompanyIds.includes(Number(companyId))) {
        return {
          success: 0,
          message: 'Access denied: cannot add a profile for a company outside your scope',
        };
      }

      const existing = await this.ucgEntity.findOne({
        where: {
          userId: Number(userId),
          groupId: Number(groupId),
          companyId: Number(companyId),
        },
      });
      if (existing) {
        return {
          success: 0,
          message: 'This profile combination already exiszts',
        };
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

  async deleteProfile(
    body: {
      id: number;
      userId: number;
    },
    req?: any,
  ) {
    try {
      const { id, userId } = body;
      if (!id || !userId) {
        return {
          success: 0,
          message: 'id and userId are required',
        };
      }

      const row = await this.ucgEntity.findOne({
        where: { id: Number(id) },
      });

      if (!row) {
        return { success: 0, message: 'Profile not found' };
      }

      if (row.userId !== Number(userId)) {
        return {
          success: 0,
          message: 'Profile does not belong to this user',
        };
      }

      if (req?.scopedCompanyIds?.length && !req.scopedCompanyIds.includes(row.companyId)) {
        return {
          success: 0,
          message: 'Access denied: cannot delete a profile outside your company',
        };
      }

      if (row.is_parent === 0) {
        return {
          success: 0,
          message: 'Cannot delete the primary profile',
        };
      }

      await this.ucgEntity.delete({ id: Number(id) });
      return { success: 1, message: 'Profile removed successfully' };
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
        (ucg) => ucg.group?.groupName === 'superAdmin',
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

      if (target.status === 'Inactive') {
        throw new BadRequestException('Cannot impersonate an inactive user');
      }

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
        impersonatorEmail: requester?.email,
        isImpersonation: true,
      });

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.USER_IMPERSONATION,
        userId: requestingUserId,
        companyId: primary?.company?.companyId,
        actorType: 'USER',
        targetType: 'USER',
        targetId: String(target.userId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: { 
          userEmail: requester?.email,
          targetEmail: target.email,
          requestingUserEmail: requester?.email,
          targetUserId: target.userId,
          targetUserEmail: target.email,
          impersonationDetails: `Admin ${requester?.email} logged in as User ${target.email}`
        },
        metadata: {},
      });

      const assignments = (target.userCompanyGroups ?? []).map((ucg) => ({
        id: ucg.id,
        companyId: ucg.companyId,
        companyName: ucg.company?.companyName ?? null,
        groupId: ucg.groupId,
        groupName: ucg.group?.groupName ?? null,
        is_parent: ucg.is_parent,
      }));

      return {
        success: 1,
        impersonationToken,
        user: {
          userId: target.userId,
          name: target.name,
          firstName: target.firstName,
          middleName: target.middleName,
          surname: target.surname,
          email: target.email,
          age: target.age,
          phone: target.phone,
          alternatePhone: target.alternatePhone,
          status: target.status,
          userFile: target.userFile,
          createdAt: target.createdAt,
          updatedDate: target.updatedDate,
          createdBy: target.createdBy,
          updatedBy: target.updatedBy,
          primaryProfile: primary
            ? {
                companyName: primary.company?.companyName,
                groupName: primary.group?.groupName,
                is_parent: primary.is_parent,
              }
            : null,
          assignments,
          permissions,
        },
      };
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      return { success: 0, message: err.message };
    }
  }

  async stopImpersonating(targetUserId: number, req: any) {
    try {
      const performerId = req?.user?.isImpersonation ? req?.user?.impersonatedBy : req?.user?.userId;
      const requester = await this.userEntity.findOne({
        where: { userId: performerId },
      });
      const target = await this.userEntity.findOne({
        where: { userId: targetUserId },
      });
      const ucg = await this.ucgEntity.findOne({
        where: { userId: targetUserId },
        relations: ['company'],
      });

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.USER_STOP_IMPERSONATION,
        userId: performerId,
        companyId: ucg?.company?.companyId,
        actorType: 'USER',
        targetType: 'USER',
        targetId: String(targetUserId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: { 
          userEmail: requester?.email,
          targetEmail: target?.email,
          requestingUserEmail: requester?.email,
          targetUserId,
          targetUserEmail: target?.email,
          impersonationDetails: `Admin ${requester?.email} stopped impersonating User ${target?.email}`
        },
        metadata: {},
      });

      return { success: 1, message: 'Impersonation stopped successfully' };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }
}
