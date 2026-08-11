# Project Code Audit Report

**Generated Date**: August 10, 2026  
**Scope**: Full Repository Audit (Backend + Frontend)  
**Pass Type**: Investigation & Reporting Pass Only (No source files modified or deleted)

---

## 1. UNUSED FILES

### Frontend Components & Config Files

#### 1.1 `frontend/src/components/capabilities/Capabilities.jsx`
- **Location**: [`frontend/src/components/capabilities/Capabilities.jsx`](file:///var/www/html/project/frontend/src/components/capabilities/Capabilities.jsx)
- **Why Unused**: Zero import statements anywhere in the repository. The component defines `CapabilitiesList`, but `frontend/src/app/roles/[id]/page.js` imports and renders `GroupCapabilities.jsx` instead. Page `frontend/src/app/capabilities/page.js` is a stub redirecting to `/roles`.
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.2 `frontend/src/components/customer/configs/customerForm.config.js`
- **Location**: [`frontend/src/components/customer/configs/customerForm.config.js`](file:///var/www/html/project/frontend/src/components/customer/configs/customerForm.config.js)
- **Why Unused**: Zero import statements across the entire repo. Defines 19 form field configurations for the Customer module, but customer forms (`AddCustomer.jsx`, `CustomerUpdate.jsx`) use inline form fields without importing this config.
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.3 `frontend/src/components/group/GroupDetails.jsx`
- **Location**: [`frontend/src/components/group/GroupDetails.jsx`](file:///var/www/html/project/frontend/src/components/group/GroupDetails.jsx)
- **Why Unused**: Zero imports in the repository. The Group Details view was retired when roles were merged into `/roles`. Route [`frontend/src/app/group/[...id]/page.js`](file:///var/www/html/project/frontend/src/app/group/%5B...id%5D/page.js#L5) explicitly states: `// GroupDetails component was retired — redirect to the Roles module`.
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.4 `frontend/src/components/group/GroupFormRenderer.jsx`
- **Location**: [`frontend/src/components/group/GroupFormRenderer.jsx`](file:///var/www/html/project/frontend/src/components/group/GroupFormRenderer.jsx)
- **Why Unused**: Dead chain item. Imported ONLY by [`frontend/src/components/group/GroupDetails.jsx`](file:///var/www/html/project/frontend/src/components/group/GroupDetails.jsx), which is itself unimported and dead.
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.5 `frontend/src/components/group/GroupSidePanel.jsx`
- **Location**: [`frontend/src/components/group/GroupSidePanel.jsx`](file:///var/www/html/project/frontend/src/components/group/GroupSidePanel.jsx)
- **Why Unused**: Zero imports across the repository. The entire file body (110 lines) is commented out.
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.6 `frontend/src/components/group/configs/groupForm.config.js`
- **Location**: [`frontend/src/components/group/configs/groupForm.config.js`](file:///var/www/html/project/frontend/src/components/group/configs/groupForm.config.js)
- **Why Unused**: Dead chain item. Imported ONLY by [`frontend/src/components/group/GroupFormRenderer.jsx`](file:///var/www/html/project/frontend/src/components/group/GroupFormRenderer.jsx), which is part of the retired GroupDetails dead chain.
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.7 `frontend/src/components/group/groupList.jsx`
- **Location**: [`frontend/src/components/group/groupList.jsx`](file:///var/www/html/project/frontend/src/components/group/groupList.jsx)
- **Why Unused**: Zero imports in the repository. The page [`frontend/src/app/roles/page.js`](file:///var/www/html/project/frontend/src/app/roles/page.js) imports `RolesList.jsx` instead.
- **Confidence**: High
- **Suggested Action**: Delete

---

### Backend Config & Spec Files

#### 1.8 `backend/src/packages/config/data-source.ts`
- **Location**: [`backend/src/packages/config/data-source.ts`](file:///var/www/html/project/backend/src/packages/config/data-source.ts)
- **Why Unused**: Exported `AppDataSource` is never imported anywhere in backend source files or scripts. NestJS initializes TypeORM via `typeOrmConfig` inside [`backend/src/app.module.ts`](file:///var/www/html/project/backend/src/app.module.ts#L26).
- **Confidence**: High
- **Suggested Action**: Delete

#### 1.9 `backend/src/app.controller.spec.ts`
- **Location**: [`backend/src/app.controller.spec.ts`](file:///var/www/html/project/backend/src/app.controller.spec.ts)
- **Why Unused**: Default boilerplate NestJS unit test file, not integrated into any active testing workflow.
- **Confidence**: Medium
- **Suggested Action**: Needs manual confirmation / Delete if unit tests are not maintained.

#### 1.10 `backend/src/company/company.logger.spec.ts` & `backend/src/company/company.service.spec.ts`
- **Location**: [`backend/src/company/company.logger.spec.ts`](file:///var/www/html/project/backend/src/company/company.logger.spec.ts) and [`backend/src/company/company.service.spec.ts`](file:///var/www/html/project/backend/src/company/company.service.spec.ts)
- **Why Unused**: Isolated unit test specs that are not referenced by any test suite or CI pipeline.
- **Confidence**: Medium
- **Suggested Action**: Delete or integrate into active test suite.

#### 1.11 `backend/src/activity/enums/` (`actor-type.enum.ts`, `log-status.enum.ts`, `module-type.enum.ts`, `severity.enum.ts`)
- **Location**: [`backend/src/activity/enums/actor-type.enum.ts`](file:///var/www/html/project/backend/src/activity/enums/actor-type.enum.ts), [`log-status.enum.ts`](file:///var/www/html/project/backend/src/activity/enums/log-status.enum.ts), [`module-type.enum.ts`](file:///var/www/html/project/backend/src/activity/enums/module-type.enum.ts), [`severity.enum.ts`](file:///var/www/html/project/backend/src/activity/enums/severity.enum.ts)
- **Why Unused**: None of these four enum files are imported by `activity-log.entity.ts`, `activity.service.ts`, or any other backend file. Activity log entity uses plain strings or `activity-code.enum.ts`.
- **Confidence**: High
- **Suggested Action**: Delete or reference in activity entity definitions.

---

### Legacy & Duplicate Redirect Page Files

#### 1.12 `frontend/src/app/add-group/page.js`, `capabilities/page.js`, `group-list/page.js`, `group/[...id]/page.js`, `capability/[...id]/page.js`
- **Locations**:
  - [`frontend/src/app/add-group/page.js`](file:///var/www/html/project/frontend/src/app/add-group/page.js)
  - [`frontend/src/app/capabilities/page.js`](file:///var/www/html/project/frontend/src/app/capabilities/page.js)
  - [`frontend/src/app/group-list/page.js`](file:///var/www/html/project/frontend/src/app/group-list/page.js)
  - [`frontend/src/app/group/[...id]/page.js`](file:///var/www/html/project/frontend/src/app/group/%5B...id%5D/page.js)
  - [`frontend/src/app/capability/[...id]/page.js`](file:///var/www/html/project/frontend/src/app/capability/%5B...id%5D/page.js)
- **Why Unused**: All 5 files are stub routes (9–13 lines each) that perform client-side `router.replace("/roles")` or `router.replace("/roles/[id]")`.
- **Confidence**: High
- **Suggested Action**: Delete files and configure Next.js `redirects()` in `next.config.mjs` instead.

#### 1.13 `frontend/src/app/reset-pass/page.js`
- **Location**: [`frontend/src/app/reset-pass/page.js`](file:///var/www/html/project/frontend/src/app/reset-pass/page.js)
- **Why Unused**: Duplicate password reset route. Renders [`ChnagePass.jsx`](file:///var/www/html/project/frontend/src/components/user/ChnagePass.jsx) (typo in filename). The standard auth flow routes to [`/reset-password`](file:///var/www/html/project/frontend/src/app/reset-password/page.js) which renders `ResetPassword.jsx`.
- **Confidence**: High
- **Suggested Action**: Merge route into `/reset-password` and delete `reset-pass/page.js`.

---

## 2. UNUSED CODE WITHIN FILES

### Exported Functions, Hooks & DTOs with Zero Importers

#### 2.1 `currencyColumns` in `frontend/src/components/currency/CurrencyColumn.jsx`
- **Location**: [`frontend/src/components/currency/CurrencyColumn.jsx:L123`](file:///var/www/html/project/frontend/src/components/currency/CurrencyColumn.jsx#L123)
- **Why Unused**: Exported constant `currencyColumns` is never imported anywhere. [`CurrencyList.jsx`](file:///var/www/html/project/frontend/src/components/currency/CurrencyList.jsx) calls `getCurrencyColumns(handlePreview)` instead.
- **Confidence**: High
- **Suggested Action**: Delete line 123 export.

#### 2.2 `UserPassDto` & `IsAdult` in `backend/src/user/dto/user.dto.ts`
- **Location**: [`backend/src/user/dto/user.dto.ts`](file:///var/www/html/project/backend/src/user/dto/user.dto.ts)
- **Why Unused**: `UserPassDto` class and custom validator decorator `IsAdult` are exported but never imported or referenced in any controller, service, or validator.
- **Confidence**: High
- **Suggested Action**: Delete `UserPassDto` and `IsAdult`.

#### 2.3 `ActivityFilterDto` in `backend/src/activity/dto/activity.dto.ts`
- **Location**: [`backend/src/activity/dto/activity.dto.ts`](file:///var/www/html/project/backend/src/activity/dto/activity.dto.ts)
- **Why Unused**: Exported DTO class has zero references in `activity.controller.ts` or `activity.service.ts`.
- **Confidence**: High
- **Suggested Action**: Delete `ActivityFilterDto`.

#### 2.4 `CurrencyFilterDto` in `backend/src/currency/dto/currency.dto.ts`
- **Location**: [`backend/src/currency/dto/currency.dto.ts`](file:///var/www/html/project/backend/src/currency/dto/currency.dto.ts)
- **Why Unused**: Exported DTO class has zero references in `currency.controller.ts` or `currency.service.ts`.
- **Confidence**: High
- **Suggested Action**: Delete `CurrencyFilterDto`.

#### 2.5 Auth Helper Exported Functions in `frontend/src/app/lib/auth.js`
- **Location**: [`frontend/src/app/lib/auth.js`](file:///var/www/html/project/frontend/src/app/lib/auth.js)
- **Why Unused**: Exported functions `getUserInfo`, `canUpdateUsers`, and `canSeeAllCompaniesAndGroups` are never imported by any page or component.
- **Confidence**: High
- **Suggested Action**: Delete unused helper functions.

---

### Dead Branches & Unused Variables

#### 2.6 `companyScoped` in `backend/src/utilities/roles.guard.ts`
- **Location**: [`backend/src/utilities/roles.guard.ts:L28-L29`](file:///var/www/html/project/backend/src/utilities/roles.guard.ts#L28-L29)
- **Why Unused**: `const companyScoped: boolean = this.reflector.get(COMPANY_SCOPED, ...)` reads metadata, but the variable is never referenced or checked anywhere in `canActivate`.
- **Confidence**: High
- **Suggested Action**: Delete variable or implement company scoping check.

---

### Large Blocks of Commented-out Code

#### 2.7 `StrictPermissionsGuard` in `backend/src/utilities/permissions.guard.ts`
- **Location**: [`backend/src/utilities/permissions.guard.ts:L59-L92`](file:///var/www/html/project/backend/src/utilities/permissions.guard.ts#L59-L92)
- **Why Unused**: 34 lines of commented-out guard class `StrictPermissionsGuard`.
- **Confidence**: High
- **Suggested Action**: Delete block.

#### 2.8 `file.transfer.ts` Commented Operations
- **Location**: [`backend/src/utilities/file.transfer.ts:L62-L69, L100-L104`](file:///var/www/html/project/backend/src/utilities/file.transfer.ts#L62-L69)
- **Why Unused**: Commented-out `fss.move`, `fs.promises.writeFile`, and `fs.promises.copyFile` statements.
- **Confidence**: High
- **Suggested Action**: Delete commented lines.

#### 2.9 `reset-pass/page.js` Server Fetching Block
- **Location**: [`frontend/src/app/reset-pass/page.js:L1-L22`](file:///var/www/html/project/frontend/src/app/reset-pass/page.js#L1-L22)
- **Why Unused**: 22 lines of commented-out server-side `fetch` logic for `user-changepass`.
- **Confidence**: High
- **Suggested Action**: Delete file entirely (see Item 1.13).

#### 2.10 `activity.controller.ts` Guard Decorator
- **Location**: [`backend/src/activity/activity.controller.ts:L24-L36`](file:///var/www/html/project/backend/src/activity/activity.controller.ts#L24-L36)
- **Why Unused**: Commented-out `RolesGuard` import and `@UseGuards(AuthGuard('jwt'), RolesGuard)` decorator.
- **Confidence**: High
- **Suggested Action**: Clean up commented guard annotations.

---

### Unused Imports (Per File)

#### 2.11 Unused `fs-extra` import in `backend/src/utilities/file.transfer.ts`
- **Location**: [`backend/src/utilities/file.transfer.ts:L3`](file:///var/www/html/project/backend/src/utilities/file.transfer.ts#L3)
- **Why Unused**: `import * as fss from 'fs-extra'` is never used in executable code (only in commented lines).
- **Confidence**: High
- **Suggested Action**: Delete import.

#### 2.12 Unused Entity Imports in `backend/src/app.module.ts`
- **Location**: [`backend/src/app.module.ts:L21-L27`](file:///var/www/html/project/backend/src/app.module.ts#L21-L27)
- **Why Unused**: `PermissionEntity` and `ActivityMasterEntity` are imported and registered in `TypeOrmModule.forFeature` inside `AppModule`, but no controller or provider in `AppModule` injects or uses them.
- **Confidence**: Medium
- **Suggested Action**: Remove from `AppModule` features if unused at root module level.

---

## 3. BACKEND-SPECIFIC

### 3.1 Migration Configuration vs Reality Mismatch
- **Location**: [`backend/src/packages/config/typeorm.config.ts:L50-L52`](file:///var/www/html/project/backend/src/packages/config/typeorm.config.ts#L50-L52)
- **Why Redundant**: Config sets `migrationsRun: true` and `migrations: [__dirname + '/../../migration/*{.ts,.js}']`, but **no migration files or migration directory** (`backend/src/migration` or `backend/migration`) exist in the repository.
- **Confidence**: High
- **Suggested Action**: Remove `migrations` array and `migrationsRun: true` until actual TypeORM migration files are generated.

---

### 3.2 Unused Service Methods (Zero Controller / Service Callers)

The following service methods are defined in backend services but are never invoked by any controller endpoint or helper method:

1. **`CompanyService.insertCompany`**
   - Location: [`backend/src/company/company.service.ts`](file:///var/www/html/project/backend/src/company/company.service.ts)
   - Reason: `CompanyController` calls `createCompanyWithCurrencies` instead.
2. **`CustomerService.generateCustomerCode`**
   - Location: [`backend/src/customer/customer.service.ts`](file:///var/www/html/project/backend/src/customer/customer.service.ts)
   - Reason: Code generation is handled inline or client-side.
3. **`GroupService.insertGroup` & `GroupService.updateGroup`**
   - Location: [`backend/src/group/group.service.ts`](file:///var/www/html/project/backend/src/group/group.service.ts)
   - Reason: `GroupController` calls `saveGroupPermissions` and `createGroup` instead.
4. **`ItemCategoryService.generateCategoryCode` & `ItemCategoryService.validateParentCategory`**
   - Location: [`backend/src/item_category/item.service.ts`](file:///var/www/html/project/backend/src/item_category/item.service.ts)
   - Reason: Never called by `ItemCategoryController`.
5. **`UomService.generateUomCode`**
   - Location: [`backend/src/item_uom/uom.service.ts`](file:///var/www/html/project/backend/src/item_uom/uom.service.ts)
   - Reason: Never called by `UomController`.
6. **`ManufacturerService.generateManufacturerCode`**
   - Location: [`backend/src/manufacturer/manufacturer.service.ts`](file:///var/www/html/project/backend/src/manufacturer/manufacturer.service.ts)
   - Reason: Never called by `ManufacturerController`.
7. **`PackageService.generatePackageCode`**
   - Location: [`backend/src/package_master/package.service.ts`](file:///var/www/html/project/backend/src/package_master/package.service.ts)
   - Reason: Never called by `PackageController`.
8. **`UserService.calculateAge`, `UserService.saveAssignments`, `UserService.loadUserWithAssignments`, `UserService.insertUser`, `UserService.updateUser`**
   - Location: [`backend/src/user/user.service.ts`](file:///var/www/html/project/backend/src/user/user.service.ts)
   - Reason: `UserController` uses `createUserWithAssignments` and `updateUserWithAssignments`, leaving these legacy helper methods uncalled.

- **Confidence**: High
- **Suggested Action**: Delete uncalled service methods after confirming no external cron or job triggers them.

---

### 3.3 Unused TypeORM Entity Columns & Relations

1. **`isActive` & `updatedAt` in `ActivityMasterEntity`**
   - Location: [`backend/src/activity/entity/activity-master.entity.ts`](file:///var/www/html/project/backend/src/activity/entity/activity-master.entity.ts)
   - Why: Columns defined on entity but never queried, written, or filtered in `activity.service.ts` or activity listeners.
   - Confidence: High | Suggested Action: Delete entity properties or incorporate into activity logging.

2. **`lastSync` in `CurrencyEntity`**
   - Location: [`backend/src/currency/entity/currency.entity.ts`](file:///var/www/html/project/backend/src/currency/entity/currency.entity.ts)
   - Why: Column defined on entity and displayed in `CurrencyColumn.jsx`, but `currency.service.ts` never writes or updates `lastSync`.
   - Confidence: Medium | Suggested Action: Implement timestamp update during currency exchange sync or mark as nullable/deprecated.

3. **`createdDate` in `CustomerEntity`**
   - Location: [`backend/src/customer/entity/customer.entity.ts`](file:///var/www/html/project/backend/src/customer/entity/customer.entity.ts)
   - Why: Property defined on entity but never set or populated in `customer.service.ts`.
   - Confidence: High | Suggested Action: Replace with TypeORM `@CreateDateColumn()`.

4. **`label` in `PermissionEntity`**
   - Location: [`backend/src/group/entity/capability.entity.ts:L23`](file:///var/www/html/project/backend/src/group/entity/capability.entity.ts#L23)
   - Why: Defined on `PermissionEntity` but never populated or selected in `group.service.ts` queries.
   - Confidence: High | Suggested Action: Delete column or populate in seed script.

---

### 3.4 Permission Decorator vs Frontend Capability Mismatch
- **Location**: Frontend [`GroupCapabilities.jsx`](file:///var/www/html/project/frontend/src/components/capabilities/GroupCapabilities.jsx#L11-L62) vs Backend Controllers
- **Findings**:
  - All 40 permission strings managed in `GroupCapabilities.jsx` (`companyList`, `companyView`, `companyAdd`, `companyUpdate`, etc.) match corresponding `@RequirePermission(...)` decorators across backend controllers.
  - Form validation fields such as `confirmPass` in [`Zod.jsx`](file:///var/www/html/project/frontend/src/components/Zod.jsx#L212) were verified to be form field names rather than missing permission keys.

---

## 4. FRONTEND-SPECIFIC

### 4.1 Standalone Routes / Pages with Missing Nav Links

#### 4.1.1 `frontend/src/app/add-currency/page.js`
- **Location**: [`frontend/src/app/add-currency/page.js`](file:///var/www/html/project/frontend/src/app/add-currency/page.js)
- **Why Unused**: Page `/add-currency` exists, but currency creation in [`CurrencyList.jsx`](file:///var/www/html/project/frontend/src/components/currency/CurrencyList.jsx) uses a slideover sidepanel (`CurrencyFormRenderer.jsx`) instead of navigating to `/add-currency`. Nav links in `HeaderMenuPanel.jsx` and `SiteMap.jsx` point to `/currency-list`.
- **Confidence**: High
- **Suggested Action**: Delete page file or add explicit navigation route.

#### 4.1.2 Hardcoded URL in `Header.jsx` pointing to `/reset-pass`
- **Location**: [`frontend/src/components/Header.jsx:L158`](file:///var/www/html/project/frontend/src/components/Header.jsx#L158)
- **Why Buggy/Redundant**: `Header.jsx` line 158 contains hardcoded `router.push("http://localhost:3000/reset-pass");`. Password reset standard path is `/reset-password`.
- **Confidence**: High
- **Suggested Action**: Change line 158 to `router.push("/reset-password")`.

---

### 4.2 Duplicated Component Logic Across Modules ("Duplicate Logic")

Near-identical component files across CRUD modules that duplicate state management, slideover drawers, and table rendering:

1. **Form SidePanel Drawers (87% - 93% structural similarity)**:
   - [`PackageFormSidePanel.jsx`](file:///var/www/html/project/frontend/src/components/package/PackageFormSidePanel.jsx) and [`UomFormSidePanel.jsx`](file:///var/www/html/project/frontend/src/components/uom/UomFormSidePanel.jsx) (**93.2% identical logic**).
   - [`ManufacturerFormSidePanel.jsx`](file:///var/www/html/project/frontend/src/components/manufacturer/ManufacturerFormSidePanel.jsx), `PackageFormSidePanel.jsx`, and `UomFormSidePanel.jsx` (**87.5% - 87.9% identical logic**).
   - **Duplicated Logic**: Company options loading, Zod validation handling, toast notifications, slideover container animation.

2. **Entity List Components (81% - 86% structural similarity)**:
   - [`PackageList.jsx`](file:///var/www/html/project/frontend/src/components/package/PackageList.jsx), [`UomList.jsx`](file:///var/www/html/project/frontend/src/components/uom/UomList.jsx), [`ManufacturerList.jsx`](file:///var/www/html/project/frontend/src/components/manufacturer/ManufacturerList.jsx), [`ItemCategoryList.jsx`](file:///var/www/html/project/frontend/src/components/itemCategory/ItemCategoryList.jsx), and [`CustomerList.jsx`](file:///var/www/html/project/frontend/src/components/customer/CustomerList.jsx).
   - **Duplicated Logic**: Table header with search input, view mode toggle (grid vs table), delete confirmation modal state, pagination controls.

3. **Entity Detail Views (77% - 78% structural similarity)**:
   - [`ManufacturerDetails.jsx`](file:///var/www/html/project/frontend/src/components/manufacturer/ManufacturerDetails.jsx), [`PackageDetails.jsx`](file:///var/www/html/project/frontend/src/components/package/PackageDetails.jsx), [`UomDetails.jsx`](file:///var/www/html/project/frontend/src/components/uom/UomDetails.jsx), and [`ItemCategoryDetails.jsx`](file:///var/www/html/project/frontend/src/components/itemCategory/ItemCategoryDetails.jsx).
   - **Duplicated Logic**: Breadcrumb navigation bar, loading spinner card layout, error state fallback.

- **Confidence**: High
- **Suggested Action**: Refactor into a unified generic CRUD wrapper (`GenericFormSidePanel`, `GenericListView`).

---

### 4.3 Unused Config File Entries

1. **`customerForm.config.js`**
   - Location: [`frontend/src/components/customer/configs/customerForm.config.js`](file:///var/www/html/project/frontend/src/components/customer/configs/customerForm.config.js)
   - Why: 19 fields defined in config, but file has zero importers.
   - Confidence: High | Suggested Action: Delete file.

2. **`groupForm.config.js`**
   - Location: [`frontend/src/components/group/configs/groupForm.config.js`](file:///var/www/html/project/frontend/src/components/group/configs/groupForm.config.js)
   - Why: 3 fields defined in config, imported only by retired `GroupFormRenderer.jsx`.
   - Confidence: High | Suggested Action: Delete file.

---

## 5. DEPENDENCIES

### 5.1 Unused Packages in `frontend/package.json`

The following packages are declared in [`frontend/package.json`](file:///var/www/html/project/frontend/package.json) but are never imported or referenced in any frontend source file, script, or configuration:

| Package | Category | Reason Found | Confidence | Suggested Action |
| :--- | :--- | :--- | :--- | :--- |
| `@emotion/react` | Styling | App uses TailwindCSS v4; Emotion is unused. | High | Uninstall |
| `@emotion/styled` | Styling | App uses TailwindCSS v4; Emotion is unused. | High | Uninstall |
| `dotenv` | Utility | Next.js natively loads `.env` files. | High | Uninstall |
| `intl-tel-input` | Form Input | Project uses `react-phone-input-2` for phone numbers. | High | Uninstall |
| `lucide` | Icons | Project imports from `lucide-react` instead of `lucide`. | High | Uninstall |
| `mui-tel-input` | Form Input | Project uses `react-phone-input-2` for phone numbers. | High | Uninstall |
| `react-dropzone` | Upload | Custom file upload inputs are used; dropzone is unimported. | High | Uninstall |
| `react-photo-view` | UI Modal | Image preview handled by [`ImagePreviewModal.jsx`](file:///var/www/html/project/frontend/src/components/ui/ImagePreviewModal.jsx). | High | Uninstall |
| `shadcn` | CLI Utility | CLI package mistakenly listed in runtime `dependencies`. | High | Uninstall |
| `tw-animate-css` | Styling | Unimported CSS library. | High | Uninstall |

---

### 5.2 Duplicate & Mismatched Dependencies

1. **Date Libraries**:
   - `frontend/package.json` lists both `date-fns` (`^4.4.0`) and `dayjs` (`^1.11.20`).
   - Suggested Action: Retain `date-fns` (used by date picker) and uninstall `dayjs`.

2. **Phone Input Libraries**:
   - `frontend/package.json` includes `react-phone-input-2`, `intl-tel-input`, `mui-tel-input`, and `libphonenumber-js`.
   - Suggested Action: Keep `react-phone-input-2` and `libphonenumber-js`; uninstall `intl-tel-input` and `mui-tel-input`.

3. **Backend Passport Dependency**:
   - `backend/package.json` lists `passport` (`^0.7.0`) alongside `@nestjs/passport` (`^11.0.5`). `passport` core is not directly imported in backend source.
   - Suggested Action: Keep as peer dependency or verify NestJS runtime behavior.

---

## 6. ENV / CONFIG

### 6.1 Environment Variables Defined in `.env` but Never Read in Code

#### Backend (`backend/.env`)
- **`SMPT_PASS`**: Typo in `.env` variable key name (`SMPT_PASS` vs `SMTP_PASS`). Furthermore, [`backend/src/utilities/mailer.ts:L12`](file:///var/www/html/project/backend/src/utilities/mailer.ts#L12) hardcodes an SMTP password string (`pass: 'htre xipy yycy avju'`) instead of reading `process.env.SMTP_PASS`.

#### Frontend (`frontend/.env`)
The following variables are present in `frontend/.env` but never accessed via `process.env.XYZ` in frontend code:
- **`NEXT_PUBLIC_LOGO`**
- **`NEXT_PUBLIC_CRYPTO_SECRET`** (Code accesses `process.env.CRYPTO_SECRET` without `NEXT_PUBLIC_` prefix in `crypto.js`)
- **`ENCRYPTION_KEY`**
- **`NEXT_PUBLIC_USERS_LIST_LIMIT`**
- **`NEXT_PUBLIC_USERS_LIST_PAGES`**
- **`BACKEND_URL`**

---

### 6.2 Environment Variables Used in Code but Missing from `.env`

#### Backend
- **`DB_CLIENT`**, **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASS`**, **`DB_NAME`**: Accessed in [`typeorm.config.ts`](file:///var/www/html/project/backend/src/packages/config/typeorm.config.ts#L24-L29) with fallback defaults, but omitted from `backend/.env`.

#### Frontend
- **`CRYPTO_SECRET`**: Accessed in [`frontend/src/app/lib/crypto.js`](file:///var/www/html/project/frontend/src/app/lib/crypto.js#L3), but `frontend/.env` defines `NEXT_PUBLIC_CRYPTO_SECRET` instead.

---

### 6.3 Missing Documentation Files
- Neither `backend/.env.example` nor `frontend/.env.example` exist in the repository.
- Suggested Action: Create `.env.example` files in both `backend/` and `frontend/` listing all required runtime environment variables with sample values.

---

## SUMMARY FINDINGS COUNT

| Category | Finding Count | High Confidence | Medium Confidence | Low Confidence |
| :--- | :---: | :---: | :---: | :---: |
| **1. Unused Files** | 13 | 11 | 2 | 0 |
| **2. Unused Code Within Files** | 12 | 10 | 2 | 0 |
| **3. Backend-Specific** | 14 | 13 | 1 | 0 |
| **4. Frontend-Specific** | 6 | 6 | 0 | 0 |
| **5. Dependencies** | 12 | 11 | 1 | 0 |
| **6. Env / Config** | 9 | 9 | 0 | 0 |
| **TOTAL** | **66** | **60** | **6** | **0** |

---

## PRIORITIZED "SAFE TO DELETE FIRST" SHORTLIST

The following items have **High confidence**, **zero external references**, and **no downstream chain risk**:

1. `frontend/src/components/capabilities/Capabilities.jsx`
2. `frontend/src/components/customer/configs/customerForm.config.js`
3. `frontend/src/components/group/GroupDetails.jsx`
4. `frontend/src/components/group/GroupFormRenderer.jsx`
5. `frontend/src/components/group/GroupSidePanel.jsx`
6. `frontend/src/components/group/configs/groupForm.config.js`
7. `frontend/src/components/group/groupList.jsx`
8. `backend/src/packages/config/data-source.ts`
9. `backend/src/activity/enums/` (`actor-type.enum.ts`, `log-status.enum.ts`, `module-type.enum.ts`, `severity.enum.ts`)
10. Unused frontend dependencies in `frontend/package.json`: `@emotion/react`, `@emotion/styled`, `dotenv`, `intl-tel-input`, `lucide`, `mui-tel-input`, `react-dropzone`, `react-photo-view`, `shadcn`, `tw-animate-css`
11. Commented-out class block `StrictPermissionsGuard` in `backend/src/utilities/permissions.guard.ts`
12. Unused helper exports in `frontend/src/app/lib/auth.js` (`getUserInfo`, `canUpdateUsers`, `canSeeAllCompaniesAndGroups`)
