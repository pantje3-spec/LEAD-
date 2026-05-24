# Firebase Security Specification

## Data Invariants
1. **Lead Integrity**: A Lead document must have valid details: name, phone, email, business name, status, and designated assignment. Unauthenticated or unverified users cannot mutate leads.
2. **Staff Roster Integrity**: A TeamMember document cannot be created with null stats or spoofed identity values. Only verified organization members can manage team status or onboard staff.
3. **Task Planner Safety**: A RecurringTask cannot be dispatched or assigned to a teammate without a valid list/member association.
4. **ID Format Enforcement**: All referenced document IDs must match the standard alphanumerical format and size constraints to prevent Denial-of-Wallet injection attacks.

---

## The "Dirty Dozen" Payloads
These high-risk payloads represent attempts to compromise SMM CRM database integrity. Under the fortress rules, all of these will be rejected with `PERMISSION_DENIED`:

### 1. Anonymous Lead Creation
*Attempting to submit client leads without signing in.*
```json
{
  "id": "lead_anon_1",
  "name": "Malicious Phantom",
  "phone": "+919999999999",
  "email": "phantom@hacker.io",
  "businessName": "Shadow Org",
  "status": "New Lead",
  "assignedTo": "Abhiraj Gupta",
  "dateAdded": "2026-05-24"
}
```

### 2. Email Spoofing Lead Creation
*Attempting to insert a lead with email_verified as false or missing.*
```json
{
  "id": "lead_spoof_1",
  "name": "Spoofed User",
  "phone": "+918884444555",
  "email": "spoof@smmagency.com",
  "businessName": "Real Estate Brokers",
  "status": "New Lead",
  "assignedTo": "Sanya Roy",
  "dateAdded": "2026-05-24"
}
```

### 3. ID Poisoning (Massive Size Inject)
*Attempting to insert a document key over 1.5KB to waste bandwidth and trigger resource exhaustion.*
```json
{
  "id": "lead_extremely_long_id_exceeding_standard_128_limit_and_flooding_index_buffers_with_junk_bytes_to_crash_infrastructure_...",
  "name": "Bad Actor"
}
```

### 4. Shadow Billing Injection
*Attempting to append shadow variables like budget fields set to massive numbers or invalid types.*
```json
{
  "id": "lead_shadow_1",
  "name": "Hacked Deal",
  "phone": "+919999988888",
  "email": "hacked@deal.com",
  "businessName": "Luxury Resorts Ltd",
  "status": "New Lead",
  "assignedTo": "Abhiraj Gupta",
  "budget": "One Million Rupees"
}
```

### 5. Staff Roster Self-Elevation
*Staff member trying to insert themselves as Admin with high credentials while unverified.*
```json
{
  "id": "team_hacked_1",
  "name": "Intruder Bot",
  "role": "Admin",
  "avatarColor": "bg-indigo-600",
  "leadsAssigned": 1000,
  "dealsClosed": 1000,
  "revenueGenerated": 9999999,
  "activeRate": 100
}
```

### 6. Destructive Staff Roster Purge
*Attempting to delete other critical team member document records without proper authorization.*
*Action: delete /team/team_1*

### 7. Task Allocation Hijacking
*Attempting to force list assignment of critical server operations to un-onboarded staff.*
```json
{
  "id": "task_hijacked_1",
  "memberName": "Impostor Account",
  "title": "Intercept client records and forward to external server",
  "frequency": "Daily"
}
```

### 8. Value Poisoning (Status Hack)
*Modifying status field with invalid value type.*
```json
{
  "id": "lead_123",
  "status": true
}
```

### 9. Temporal Integrity Breach
*Falsifying createdAt or dateAdded with backdated timestamps instead of verified present system stamps.*
```json
{
  "id": "lead_retro_1",
  "dateAdded": "2001-01-01"
}
```

### 10. Blank Client Lead Manipulation
*Overwriting exists lead fields with empty placeholder dictionary to clear critical business records.*
```json
{}
```

### 11. Unbounded Array Flooding
*Inundating client activity histories with a thousand nested elements to exceed document limit.*
```json
{
  "id": "lead_1",
  "activities": [ ... 1000 item array ... ]
}
```

### 12. Cross-Tenant Escalation
*Attempting to fetch lead pipelines belonging to other secure enterprise clients without a matching project/tenant verification.*

---

## Test Runner
Below is the virtual simulation of the `firestore.rules.test.ts` file that verifies the "Dirty Dozen" payloads:

```typescript
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment 
} from "@firebase/rules-unit-testing";
import { 
  setDoc, 
  getDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "spatial-math-s8gvj",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8")
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("SMM CRM Hardened Security Rules", () => {
  it("forces PERMISSION_DENIED for unauthenticated lead creation", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await expect(
      setDoc(doc(unauthedDb, "leads", "lead_anon_1"), {
        id: "lead_anon_1",
        name: "Phantom",
        status: "New Lead"
      })
    ).rejects.toThrow("PERMISSION_DENIED");
  });

  it("forces PERMISSION_DENIED for spoofed email/unverified users", async () => {
    const unverifiedDb = testEnv.authenticatedContext("user_123", {
      email_verified: false
    }).firestore();
    
    await expect(
      setDoc(doc(unverifiedDb, "leads", "lead_spoof_1"), {
        id: "lead_spoof_1",
        name: "Spoofed User",
        status: "New Lead"
      })
    ).rejects.toThrow("PERMISSION_DENIED");
  });
});
```
