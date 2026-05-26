import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import { auth, db, OperationType, handleFirestoreError } from "./firebase";
import { Lead, TeamMember, RecurringTask } from "./types";

export function useFirebaseSync(
  initialLeads: Lead[],
  initialTeam: TeamMember[],
  initialTasks: RecurringTask[],
  onSyncLeads: (leads: Lead[]) => void,
  onSyncTeam: (team: TeamMember[]) => void,
  onSyncTasks: (tasks: RecurringTask[]) => void
) {
  const [currentUser, setCurrentUser] = useState<User | null>({
    uid: "offline_g",
    email: "abhirajgupta12p@gmail.com",
    displayName: "Abhiraj Gupta",
  } as any);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser({
          uid: "offline_g",
          email: "abhirajgupta12p@gmail.com",
          displayName: "Abhiraj Gupta",
        } as any);
      }
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Listeners for Firestore data when authenticated
  useEffect(() => {
    if (!currentUser || currentUser.uid === "offline_g") {
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);

    // 1. Listen for Leads
    const unsubLeads = onSnapshot(
      collection(db, "users", currentUser.uid, "leads"),
      (snapshot) => {
        const fetchedLeads: Lead[] = [];
        snapshot.forEach((doc) => {
          fetchedLeads.push(doc.data() as Lead);
        });
        
        if (fetchedLeads.length > 0) {
          onSyncLeads(fetchedLeads);
        } else {
          // If Firestore is empty, seed it with the user's existing local leads
          initialLeads.forEach(async (lead) => {
            try {
              await setDoc(doc(db, "users", currentUser.uid, "leads", lead.id), lead);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/leads/${lead.id}`);
            }
          });
        }
        setIsSyncing(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/leads`);
        setIsSyncing(false);
      }
    );

    // 2. Listen for Team
    const unsubTeam = onSnapshot(
      collection(db, "users", currentUser.uid, "team"),
      (snapshot) => {
        const fetchedTeam: TeamMember[] = [];
        snapshot.forEach((doc) => {
          fetchedTeam.push(doc.data() as TeamMember);
        });

        if (fetchedTeam.length > 0) {
          onSyncTeam(fetchedTeam);
        } else {
          // If Firestore is empty, seed it with the default team
          initialTeam.forEach(async (member) => {
            try {
              await setDoc(doc(db, "users", currentUser.uid, "team", member.id), member);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/team/${member.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/team`);
      }
    );

    // 3. Listen for Recurring Tasks
    const unsubTasks = onSnapshot(
      collection(db, "users", currentUser.uid, "recurring_tasks"),
      (snapshot) => {
        const fetchedTasks: RecurringTask[] = [];
        snapshot.forEach((doc) => {
          fetchedTasks.push(doc.data() as RecurringTask);
        });

        if (fetchedTasks.length > 0) {
          onSyncTasks(fetchedTasks);
        } else {
          // If Firestore is empty, seed it with default local tasks
          initialTasks.forEach(async (task) => {
            try {
              await setDoc(doc(db, "users", currentUser.uid, "recurring_tasks", task.id), task);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/recurring_tasks/${task.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/recurring_tasks`);
      }
    );

    return () => {
      unsubLeads();
      unsubTeam();
      unsubTasks();
    };
  }, [currentUser]);

  // Sign in / out functions
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed: ", err);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.warn("Direct sign in failed, trying automatic signup: ", err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/operation-not-allowed" || err.code === "auth/configuration-not-allowed") {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: "Admin SMM Manager" });
        } catch (regErr: any) {
          console.error("Registration failed as well: ", regErr);
          if (regErr.code === "auth/email-already-in-use") {
            throw new Error(`The email "${email}" is already registered. The password you entered is incorrect. please check your password or use "Reset Password".`);
          }
          if (regErr.code === "auth/weak-password") {
            throw new Error("The password is too weak. Please use at least 6 characters.");
          }
          throw new Error(regErr.message || "Registration failed. Click Google Sign In or bypass with Offline Mode.");
        }
      } else {
        throw err;
      }
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!email) {
      throw new Error("Please enter an email address to reset password.");
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Password reset error: ", err);
      throw new Error(err.message || "Failed to send password reset email.");
    }
  };

  const loginOffline = () => {
    setCurrentUser({
      uid: "offline_g",
      email: "abhirajgupta12p@gmail.com",
      displayName: "Abhiraj Gupta (Local Workspace)",
    } as any);
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  // Mutator actions that write to firestore if logged in, else write to local cache (handled by app)
  const saveLeadToCloud = async (lead: Lead) => {
    if (!currentUser || currentUser.uid === "offline_g") return;
    try {
      await setDoc(doc(db, "users", currentUser.uid, "leads", lead.id), lead);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/leads/${lead.id}`);
    }
  };

  const deleteLeadFromCloud = async (leadId: string) => {
    if (!currentUser || currentUser.uid === "offline_g") return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "leads", leadId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/leads/${leadId}`);
    }
  };

  const saveTeamMemberToCloud = async (member: TeamMember) => {
    if (!currentUser || currentUser.uid === "offline_g") return;
    try {
      await setDoc(doc(db, "users", currentUser.uid, "team", member.id), member);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/team/${member.id}`);
    }
  };

  const deleteTeamMemberFromCloud = async (memberId: string) => {
    if (!currentUser || currentUser.uid === "offline_g") return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "team", memberId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/team/${memberId}`);
    }
  };

  const saveTaskToCloud = async (task: RecurringTask) => {
    if (!currentUser || currentUser.uid === "offline_g") return;
    try {
      await setDoc(doc(db, "users", currentUser.uid, "recurring_tasks", task.id), task);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/recurring_tasks/${task.id}`);
    }
  };

  const deleteTaskFromCloud = async (taskId: string) => {
    if (!currentUser || currentUser.uid === "offline_g") return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "recurring_tasks", taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/recurring_tasks/${taskId}`);
    }
  };

  return {
    currentUser,
    isAuthLoading,
    isSyncing,
    loginWithGoogle,
    loginWithEmail,
    sendPasswordReset,
    loginOffline,
    logoutUser,
    saveLeadToCloud,
    deleteLeadFromCloud,
    saveTeamMemberToCloud,
    deleteTeamMemberFromCloud,
    saveTaskToCloud,
    deleteTaskFromCloud,
  };
}
