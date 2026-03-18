"use client";

import { useState } from "react";

export default function SeedAdminPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const seedAdmin = async () => {
    setLoading(true);
    setStatus("Seeding admin user...");

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { doc, setDoc } = await import("firebase/firestore");
      const { getFirebaseAuth, getFirebaseDb } = await import("@/lib/firebase");

      const auth = await getFirebaseAuth();
      const db = await getFirebaseDb();

      // Sign in as admin (user already exists in Firebase Auth)
      const result = await signInWithEmailAndPassword(
        auth,
        "admin@gmail.com",
        "123#Admin1"
      );

      const uid = result.user.uid;
      setStatus(`Signed in as admin (${uid}). Creating Firestore document...`);

      // Create the user document in Firestore
      await setDoc(doc(db, "users", uid), {
        userId: uid,
        firstName: "Admin",
        lastName: "Kaidenz",
        email: "admin@gmail.com",
        phone: "",
        profilePicUrl: "",
        role: "admin",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setStatus(
        `Admin user seeded successfully! UID: ${uid}. You can now sign in from the login page. Delete this page when done.`
      );
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#0A0800",
        color: "white",
        gap: "20px",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Seed Admin User</h1>
      <p style={{ color: "#999", maxWidth: "400px", textAlign: "center" }}>
        This will create the admin user document in Firestore so login works.
        Run once, then delete this page.
      </p>
      <button
        onClick={seedAdmin}
        disabled={loading}
        style={{
          backgroundColor: "#F5A623",
          color: "black",
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? "Seeding..." : "Seed Admin"}
      </button>
      {status && (
        <p
          style={{
            color: status.startsWith("Error") ? "#ff6b6b" : "#4ade80",
            maxWidth: "500px",
            textAlign: "center",
            padding: "10px",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
