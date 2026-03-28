import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import path from "path";

if (!getApps().length) {
  const serviceAccountPath = path.join(
    process.cwd(),
    "service-account.json"
  );

  initializeApp({
    credential: cert(serviceAccountPath),
    projectId: "kaidenz",
  });
}

export const adminDb = getFirestore();
export const adminMessaging = getMessaging();
