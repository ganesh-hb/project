process.env.JWT_SECRET = 'hiddenbrainsinfotechpune';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/packages/entity/user.entity';
import { GroupEntity } from '../src/packages/entity/group.entity';
import { CompanyEntity } from '../src/packages/entity/company.entity';
import { UserCompanyGroupEntity } from '../src/packages/entity/user.company.group.entity';
import { PermissionEntity, GroupPermissionEntity } from '../src/packages/entity/capability.entity';
import { JwtService } from '@nestjs/jwt';

describe('User Profile Deletion (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<UserEntity>;
  let groupRepo: Repository<GroupEntity>;
  let companyRepo: Repository<CompanyEntity>;
  let ucgRepo: Repository<UserCompanyGroupEntity>;
  let permissionRepo: Repository<PermissionEntity>;
  let groupPermissionRepo: Repository<GroupPermissionEntity>;
  let jwtService: JwtService;

  let testCompany: CompanyEntity;
  let superAdminGroup: GroupEntity;
  let companyAdminGroup: GroupEntity;
  let testUser: UserEntity;
  let superAdminUser: UserEntity;
  let companyAdminUser: UserEntity;

  let superAdminToken: string;
  let companyAdminToken: string;

  let primaryUcg: UserCompanyGroupEntity;
  let secondaryUcg: UserCompanyGroupEntity;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    userRepo = app.get(getRepositoryToken(UserEntity));
    groupRepo = app.get(getRepositoryToken(GroupEntity));
    companyRepo = app.get(getRepositoryToken(CompanyEntity));
    ucgRepo = app.get(getRepositoryToken(UserCompanyGroupEntity));
    permissionRepo = app.get(getRepositoryToken(PermissionEntity));
    groupPermissionRepo = app.get(getRepositoryToken(GroupPermissionEntity));
    jwtService = app.get(JwtService);

    // 1. Reuse existing Company
    testCompany = await companyRepo.findOneOrFail({ where: {} });

    // 2. Setup/Find Groups
    let superAdmin = await groupRepo.findOne({ where: { groupName: 'superAdmin' } });
    if (!superAdmin) {
      superAdmin = await groupRepo.save(
        groupRepo.create({
          groupName: 'superAdmin',
          groupCode: 'SUP',
          status: 'Active',
        })
      );
    }
    superAdminGroup = superAdmin;

    companyAdminGroup = await groupRepo.save(
      groupRepo.create({
        groupName: 'companyAdmin',
        groupCode: 'CADM',
        status: 'Active',
      })
    );

    // 3. Grant userUpdate permission to companyAdminGroup so they pass PermissionsGuard
    let userUpdatePerm = await permissionRepo.findOne({ where: { permissionName: 'userUpdate' } });
    if (!userUpdatePerm) {
      userUpdatePerm = await permissionRepo.save(
        permissionRepo.create({
          permissionName: 'userUpdate',
          module: 'user',
          label: 'User Update',
        })
      );
    }
    await groupPermissionRepo.save(
      groupPermissionRepo.create({
        groupId: companyAdminGroup.groupId,
        permissionId: userUpdatePerm.permissionId,
      })
    );

    // 4. Create Users
    superAdminUser = await userRepo.save(
      userRepo.create({
        name: 'E2E Super Admin',
        email: 'superadmin_e2e@example.com',
        age: 30,
        phone: '1234567890',
        status: 'Active',
        password: 'password',
      })
    );

    companyAdminUser = await userRepo.save(
      userRepo.create({
        name: 'E2E Company Admin',
        email: 'companyadmin_e2e@example.com',
        age: 30,
        phone: '1234567891',
        status: 'Active',
        password: 'password',
      })
    );

    testUser = await userRepo.save(
      userRepo.create({
        name: 'E2E Target User',
        email: 'target_e2e@example.com',
        age: 25,
        phone: '1234567892',
        status: 'Active',
        password: 'password',
      })
    );

    // 5. Setup Profile Assignments
    // Super Admin assignment
    await ucgRepo.save(
      ucgRepo.create({
        userId: superAdminUser.userId,
        companyId: testCompany.companyId,
        groupId: superAdminGroup.groupId,
        is_parent: 0,
      })
    );

    // Company Admin assignment
    await ucgRepo.save(
      ucgRepo.create({
        userId: companyAdminUser.userId,
        companyId: testCompany.companyId,
        groupId: companyAdminGroup.groupId,
        is_parent: 0,
      })
    );

    // Target User assignments: 1 primary, 1 secondary
    primaryUcg = await ucgRepo.save(
      ucgRepo.create({
        userId: testUser.userId,
        companyId: testCompany.companyId,
        groupId: companyAdminGroup.groupId,
        is_parent: 0, // primary
      })
    );

    secondaryUcg = await ucgRepo.save(
      ucgRepo.create({
        userId: testUser.userId,
        companyId: testCompany.companyId,
        groupId: companyAdminGroup.groupId,
        is_parent: 1, // secondary
      })
    );

    // 6. Sign JWTs
    superAdminToken = jwtService.sign({
      userId: superAdminUser.userId,
      email: superAdminUser.email,
    });

    companyAdminToken = jwtService.sign({
      userId: companyAdminUser.userId,
      email: companyAdminUser.email,
    });
  });

  afterAll(async () => {
    // Cleanup temporary test data
    if (testUser) await userRepo.delete({ userId: testUser.userId });
    if (superAdminUser) await userRepo.delete({ userId: superAdminUser.userId });
    if (companyAdminUser) await userRepo.delete({ userId: companyAdminUser.userId });
    if (companyAdminGroup) await groupRepo.delete({ groupId: companyAdminGroup.groupId });
    await app.close();
  });

  it('1. Reject non-superAdmin with userUpdate permission (roles guard block)', async () => {
    const res = await request(app.getHttpServer())
      .post('/user/user-delete-profile')
      .set('Authorization', `Bearer ${companyAdminToken}`)
      .send({
        id: secondaryUcg.id,
        userId: testUser.userId,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Access denied');
  });

  it('2. Reject superAdmin attempting to delete primary profile (service validation block)', async () => {
    const res = await request(app.getHttpServer())
      .post('/user/user-delete-profile')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        id: primaryUcg.id,
        userId: testUser.userId,
      });

    expect(res.status).toBe(201); // controller successfully invoked and returned the encrypted payload
    
    // Decrypt the payload if it is encrypted
    const crypto = require('../src/utilities/crypto');
    const decrypted = res.body.encrypted ? crypto.decryptResponse(res.body.encrypted) : res.body;

    expect(decrypted.success).toBe(0);
    expect(decrypted.message).toBe('Cannot delete the primary profile');
  });

  it('3. Accept superAdmin deleting non-primary profile (successful deletion)', async () => {
    const res = await request(app.getHttpServer())
      .post('/user/user-delete-profile')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        id: secondaryUcg.id,
        userId: testUser.userId,
      });

    expect(res.status).toBe(201);
    
    const crypto = require('../src/utilities/crypto');
    const decrypted = res.body.encrypted ? crypto.decryptResponse(res.body.encrypted) : res.body;

    expect(decrypted.success).toBe(1);
    expect(decrypted.message).toBe('Profile removed successfully');

    // Confirm it is deleted from DB
    const check = await ucgRepo.findOne({ where: { id: secondaryUcg.id } });
    expect(check).toBeNull();
  });
});
