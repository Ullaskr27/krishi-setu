/**
 * Phase 0 Security Test Specification for Smart Crop Suggestion System Firestore Rules.
 * Verifies the "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expected: 'PERMISSION_DENIED';
  payload?: Record<string, unknown>;
}

export const dirtyDozenSecurityCases: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Profile Read',
    collectionPath: '/farmers/user_1',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-User PII Profile Read',
    collectionPath: '/farmers/user_1',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Profile Create',
    collectionPath: '/farmers/user_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'user_1', name: 'Test', email: 'test@example.com' },
  },
  {
    id: 4,
    name: 'UID Spoofing on Profile Create',
    collectionPath: '/farmers/user_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'user_2', name: 'Spoof' },
  },
  {
    id: 5,
    name: 'Shadow Field Injection (isAdmin)',
    collectionPath: '/farmers/user_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'user_1', name: 'Farmer', isAdmin: true },
  },
  {
    id: 6,
    name: 'Forged Client Timestamp on Create',
    collectionPath: '/farmers/user_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'user_1', createdAt: '2020-01-01T00:00:00Z' },
  },
  {
    id: 7,
    name: 'Immutable createdAt Mutation on Update',
    collectionPath: '/farmers/user_1',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    payload: { createdAt: 'serverTimestamp()' },
  },
  {
    id: 8,
    name: 'Orphaned Farm Plot Without Parent Profile',
    collectionPath: '/farmers/user_1/farms/farm_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user_1', farmName: 'Orphan Plot' },
  },
  {
    id: 9,
    name: 'Path ID Poisoning',
    collectionPath: '/farmers/user_1/farms/invalid$id!',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user_1', farmName: 'Plot' },
  },
  {
    id: 10,
    name: 'Oversized String Resource Exhaustion',
    collectionPath: '/farmers/user_1/farms/farm_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user_1', farmName: 'A'.repeat(500) },
  },
  {
    id: 11,
    name: 'Invalid Enum Status on Farm Plot',
    collectionPath: '/farmers/user_1/farms/farm_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user_1', status: 'InvalidState' },
  },
  {
    id: 12,
    name: 'Cross-User Blanket List Scraping',
    collectionPath: '/farmers/user_1/farms',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
  },
];
