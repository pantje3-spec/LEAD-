import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Listeners for Firestore data when authenticated
  useEffect(() => {
    if (!currentUser) {
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);

    // 1. Listen for Leads
    const unsubLeads = onSnapshot(
      collection(db, "leads"),
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
              await setDoc(doc(db, "leads", lead.id), lead);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `leads/${lead.id}`);
            }
          });
        }
        setIsSyncing(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "leads");
        setIsSyncing(false);
      }
    );

    // 2. Listen for Team
    const unsubTeam = onSnapshot(
      collection(db, "team"),
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
              await setDoc(doc(db, "team", member.id), member);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `team/${member.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "team");
      }
    );

    // 3. Listen for Recurring Tasks
    const unsubTasks = onSnapshot(
      collection(db, "recurring_tasks"),
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
              await setDoc(doc(db, "recurring_tasks", task.id), task);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `recurring_tasks/${task.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "recurring_tasks");
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
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/configuration-not-allowed") {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: "Admin SMM Manager" });
        } catch (regErr: any) {
          console.error("Registration failed as well: ", regErr);
          throw new Error(err.message || "Email Auth not enabled. Click Google Sign In or configure Email Provider in Firebase!");
        }
      } else {
        throw err;
      }
    }
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
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "leads", lead.id), lead);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `leads/${lead.id}`);
    }
  };

  const deleteLeadFromCloud = async (leadId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "leads", leadId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `leads/${leadId}`);
    }
  };

  const saveTeamMemberToCloud = async (member: TeamMember) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "team", member.id), member);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `team/${member.id}`);
    }
  };

  const deleteTeamMemberFromCloud = async (memberId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "team", memberId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `team/${memberId}`);
    }
  };

  const saveTaskToCloud = async (task: RecurringTask) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "recurring_tasks", task.id), task);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `recurring_tasks/${task.id}`);
    }
  };

  const deleteTaskFromCloud = async (taskId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "recurring_tasks", taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `recurring_tasks/${taskId}`);
    }
  };

  return {
    currentUser,
    isAuthLoading,
    isSyncing,
    loginWithGoogle,
    loginWithEmail,
    logoutUser,
    saveLeadToCloud,
    deleteLeadFromCloud,
    saveTeamMemberToCloud,
    deleteTeamMemberFromCloud,
    saveTaskToCloud,
    deleteTaskFromCloud,
  };
}
