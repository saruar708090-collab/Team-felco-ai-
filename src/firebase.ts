/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  setLogLevel,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence internal @firebase/firestore 10s connection timeout warnings on slow mobile networks
setLogLevel('silent');

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
const targetDbId = dbId && dbId !== '(default)' ? dbId : undefined;

function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      },
      targetDbId
    );
  } catch {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        localCache: memoryLocalCache()
      },
      targetDbId
    );
  }
}

export const db = createFirestoreInstance();

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
