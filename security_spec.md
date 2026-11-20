# Firestore Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Farmer Profile Ownership & PII Isolation**: A `/farmers/{farmerId}` document can only be read, created, or updated by the authenticated, email-verified user whose `request.auth.uid == farmerId`. Blanket `list` queries on `/farmers` are forbidden.
2. **Master Gate for Subcollections**: A `/farmers/{farmerId}/farms/{farmId}` or `/farmers/{farmerId}/cropHistory/{historyId}` document cannot exist without its parent `/farmers/{farmerId}` document existing, and `ownerId` must equal `farmerId` and `request.auth.uid`.
3. **Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on update. `updatedAt` must equal `request.time` on creation and update.
4. **Strict Field Allowlisting & Boundary Enforcement**: Shadow/unknown fields are rejected via `keys().hasAll(...) && keys().hasOnly(...)` on create and `affectedKeys().hasOnly(...)` on update. All strings have explicit `.size()` bounds.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unauthenticated Profile Read**: Anonymous client attempts `GET /farmers/user_1` -> `PERMISSION_DENIED`.
2. **Cross-User Profile Read (PII Leak)**: Signed-in `user_2` attempts `GET /farmers/user_1` -> `PERMISSION_DENIED`.
3. **Unverified Email Write**: Signed-in user with `email_verified: false` attempts `CREATE /farmers/user_1` -> `PERMISSION_DENIED`.
4. **Profile UID Spoofing**: Signed-in `user_1` attempts `CREATE /farmers/user_1` with `uid: "user_2"` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Profile**: Signed-in `user_1` includes `isAdmin: true` in `CREATE /farmers/user_1` -> `PERMISSION_DENIED`.
6. **Client Timestamp Forgery**: Signed-in `user_1` sends `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time` -> `PERMISSION_DENIED`.
7. **Immutable `createdAt` Tampering**: Signed-in `user_1` attempts `UPDATE /farmers/user_1` altering `createdAt` or `uid` -> `PERMISSION_DENIED`.
8. **Orphaned Farm Plot Creation**: Signed-in `user_1` attempts `CREATE /farmers/user_1/farms/farm_1` before `/farmers/user_1` exists -> `PERMISSION_DENIED`.
9. **Path Variable ID Poisoning**: Signed-in `user_1` attempts `CREATE /farmers/user_1/farms/bad$id!with/symbols` -> `PERMISSION_DENIED`.
10. **Denial of Wallet Long String**: Signed-in `user_1` sends a 5,000-character `farmName` -> `PERMISSION_DENIED`.
11. **Invalid Enum Value**: Signed-in `user_1` sends `status: "Deleted"` on a farm plot -> `PERMISSION_DENIED`.
12. **Blanket List Scraping**: Signed-in `user_2` attempts `LIST /farmers` or `LIST /farmers/user_1/farms` -> `PERMISSION_DENIED`.
