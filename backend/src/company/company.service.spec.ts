import { CompanyService } from './company.service';
import { CompanyCurrencyEntity } from 'src/packages/entity/company.currency.entity';
import { CompanyEntity } from './entity/company.entity';
import { In } from 'typeorm';

describe('CompanyService - updateCompany currency diff logic', () => {
  let service: CompanyService;
  let mockFileTransfer: any;
  let mockEventEmitter: any;
  let mockDataSource: any;
  let mockManager: any;

  beforeEach(() => {
    mockFileTransfer = {
      fileTransfer3: jest.fn().mockResolvedValue(true),
    };
    mockEventEmitter = {
      emit: jest.fn(),
    };
    mockManager = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      insert: jest.fn().mockResolvedValue({ identifiers: [] }),
    };
    mockDataSource = {
      transaction: jest.fn(async (cb: any) => cb(mockManager)),
    };

    service = new CompanyService(
      mockFileTransfer,
      mockEventEmitter,
      mockDataSource,
    );
  });

  const mockReq = {
    activeProfileResolved: true,
    isSuperAdmin: true,
    activeCompanyId: 1,
    activeGroupId: 1,
    activeGroupName: 'Admin',
    scopedCompanyIds: [1],
    user: { userId: 1, email: 'admin@example.com' },
  };

  it('CASE 1: No-change update (curIds identical to current mappings) -> ZERO delete/insert queries executed', async () => {
    // Current DB state: currencies 1 and 2 mapped
    mockManager.find.mockResolvedValue([
      { id: 101, companyId: 1, curId: 1 },
      { id: 102, companyId: 1, curId: 2 },
    ]);

    const result = await service.updateCompany(
      { companyId: 1, curIds: [1, 2] },
      null,
      mockReq,
    );

    expect(result).toEqual({ success: 1, message: 'Updated successfully' });
    expect(mockManager.find).toHaveBeenCalledWith(CompanyCurrencyEntity, {
      where: { companyId: 1 },
      select: ['id', 'curId'],
    });

    // VERIFICATION: Zero delete and zero insert calls!
    expect(mockManager.delete).not.toHaveBeenCalled();
    expect(mockManager.insert).not.toHaveBeenCalled();
  });

  it('CASE 2: Newly added currency -> ONLY insert fired for new currency', async () => {
    mockManager.find.mockResolvedValue([
      { id: 101, companyId: 1, curId: 1 },
      { id: 102, companyId: 1, curId: 2 },
    ]);

    await service.updateCompany(
      { companyId: 1, curIds: [1, 2, 3] },
      null,
      mockReq,
    );

    expect(mockManager.delete).not.toHaveBeenCalled();
    expect(mockManager.insert).toHaveBeenCalledTimes(1);
    expect(mockManager.insert).toHaveBeenCalledWith(CompanyCurrencyEntity, [
      { companyId: 1, curId: 3 },
    ]);
  });

  it('CASE 3: Removed currency -> ONLY delete fired for removed PK', async () => {
    mockManager.find.mockResolvedValue([
      { id: 101, companyId: 1, curId: 1 },
      { id: 102, companyId: 1, curId: 2 },
    ]);

    await service.updateCompany(
      { companyId: 1, curIds: [1] },
      null,
      mockReq,
    );

    expect(mockManager.delete).toHaveBeenCalledTimes(1);
    expect(mockManager.delete).toHaveBeenCalledWith(CompanyCurrencyEntity, {
      id: In([102]),
    });
    expect(mockManager.insert).not.toHaveBeenCalled();
  });

  it('CASE 4: Both add and remove -> delete removed PK, insert new curId', async () => {
    mockManager.find.mockResolvedValue([
      { id: 101, companyId: 1, curId: 1 },
      { id: 102, companyId: 1, curId: 2 },
    ]);

    await service.updateCompany(
      { companyId: 1, curIds: [2, 3] },
      null,
      mockReq,
    );

    expect(mockManager.delete).toHaveBeenCalledTimes(1);
    expect(mockManager.delete).toHaveBeenCalledWith(CompanyCurrencyEntity, {
      id: In([101]),
    });
    expect(mockManager.insert).toHaveBeenCalledTimes(1);
    expect(mockManager.insert).toHaveBeenCalledWith(CompanyCurrencyEntity, [
      { companyId: 1, curId: 3 },
    ]);
  });
});
