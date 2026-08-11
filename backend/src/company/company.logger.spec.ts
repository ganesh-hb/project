import { CompanyService } from './company.service';
import { CompanyCurrencyEntity } from 'src/packages/entity/company.currency.entity';
import { In } from 'typeorm';

describe('CompanyService Query Execution Verification', () => {
  it('Logs every query executed during a NO-CHANGE update vs DIFF update', async () => {
    const executedQueries: string[] = [];

    const mockManager: any = {
      update: jest.fn(async (entity, criteria, values) => {
        executedQueries.push(`UPDATE ${entity.name || 'CompanyEntity'}`);
        return { affected: 1 };
      }),
      find: jest.fn(async (entity, options) => {
        executedQueries.push(
          `SELECT id, curId FROM company_currency WHERE companyId = ${options.where.companyId}`,
        );
        return [
          { id: 101, companyId: 1, curId: 1 },
          { id: 102, companyId: 1, curId: 2 },
        ];
      }),
      delete: jest.fn(async (entity, criteria) => {
        executedQueries.push(
          `DELETE FROM company_currency WHERE id IN (${criteria.id.value.join(',')})`,
        );
        return { affected: 1 };
      }),
      insert: jest.fn(async (entity, values) => {
        executedQueries.push(
          `INSERT INTO company_currency (${JSON.stringify(values)})`,
        );
        return { identifiers: [] };
      }),
    };

    const mockDataSource: any = {
      transaction: jest.fn(async (cb: any) => cb(mockManager)),
    };

    const service = new CompanyService(
      { fileTransfer3: jest.fn() } as any,
      { emit: jest.fn() } as any,
      mockDataSource,
    );

    const mockReq = {
      activeProfileResolved: true,
      isSuperAdmin: true,
      activeCompanyId: 1,
      scopedCompanyIds: [1],
    };

    console.log('\n--- SCENARIO 1: NO-CHANGE UPDATE (curIds: [1, 2]) ---');
    executedQueries.length = 0;
    await service.updateCompany({ companyId: 1, curIds: [1, 2] }, null, mockReq);

    console.log('Fired Queries Count:', executedQueries.length);
    executedQueries.forEach((q, idx) => console.log(`  [Query ${idx + 1}] ${q}`));

    const deleteCountNoChange = executedQueries.filter((q) => q.startsWith('DELETE')).length;
    const insertCountNoChange = executedQueries.filter((q) => q.startsWith('INSERT')).length;

    console.log(`DELETE Queries Fired: ${deleteCountNoChange}`);
    console.log(`INSERT Queries Fired: ${insertCountNoChange}`);

    expect(deleteCountNoChange).toBe(0);
    expect(insertCountNoChange).toBe(0);

    console.log('\n--- SCENARIO 2: DIFF UPDATE (curIds: [2, 3]) ---');
    executedQueries.length = 0;
    await service.updateCompany({ companyId: 1, curIds: [2, 3] }, null, mockReq);

    console.log('Fired Queries Count:', executedQueries.length);
    executedQueries.forEach((q, idx) => console.log(`  [Query ${idx + 1}] ${q}`));

    const deleteCountDiff = executedQueries.filter((q) => q.startsWith('DELETE')).length;
    const insertCountDiff = executedQueries.filter((q) => q.startsWith('INSERT')).length;

    console.log(`DELETE Queries Fired: ${deleteCountDiff}`);
    console.log(`INSERT Queries Fired: ${insertCountDiff}`);

    expect(deleteCountDiff).toBe(1);
    expect(insertCountDiff).toBe(1);
  });
});
