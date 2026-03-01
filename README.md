# Hotel Management System  
**Role-Based Full-Stack Web Application (React + TypeScript + Firebase)**

---

## Live Demo
**Access the website:** https://hotelmanagement-e654a.web.app/login

---

## Overview

A production-style hotel management system designed for receptionists, managers, and administrators.

The system manages:

- Guest reservations
- Real-time check-in / check-out workflows
- Room assignment & live status tracking
- Payment recording and balance computation
- Guest archiving system
- Automated email notifications
- Role-based security enforcement

Built with a strong focus on **data integrity, security rules, and real-world workflow modeling**.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Firebase Firestore (NoSQL database)
- Firebase Authentication
- Firebase Cloud Functions (v2)

### Email Automation
- SendGrid API

---

## Core Features

### Role-Based Access Control
Supports:
- Admin
- Manager
- Staff

Firestore security rules enforce:
- Role-based document permissions
- Field-level update restrictions
- Active account validation
- Restricted modification of sensitive room data

---

### Guest Management
- Add, edit, and delete guests
- Real-time guest list using Firestore `onSnapshot`
- Search, filter, and sort functionality
- Card and table view toggle
- Automatic computed status:
  - Reserved
  - Checked-in
  - Due check-in
  - Due check-out
  - Overdue
  - Checked-out

---

### Room Management
- Room inventory system
- Live room status updates:
  - Available
  - Reserved
  - Occupied
  - Cleaning
- Automatic assignment & release of rooms
- Staff restricted from editing room pricing or structure

---

### Check-In Workflow
When checking in a guest:
- Guest → `checkedIn: true`
- Room → `Occupied`
- Confirmation email automatically sent (Cloud Function)
- Duplicate email sends prevented

---

### Check-Out Workflow
Checkout handles multi-step operations:

1. Final payment calculation
2. Guest update → `checkedOut: true`
3. Room update → `Cleaning`
4. Log entry creation
5. Guest archived to `archivedGuests`
6. Automated check-out email sent

Includes:
- Double-submit protection
- Permission-denied handling
- Schema-safe Firestore updates
- Balance validation

---

### Payment Tracking
- Payments linked via `guestId`
- Calculates total paid vs total cost
- Tracks remaining balance
- Supports:
  - Cash
  - Card
  - GCash

---

### Archiving System
Completed stays are moved to:
archivedGuests/

Keeps active operational data clean while preserving:
- Billing information
- Stay metadata
- Room details
- Timestamps

---

### Logging System
Every checkout writes to:
logs/

- Admin-only read access
- Immutable records
- Useful for auditing

---

### Automated Email Notifications

Cloud Functions handle:

- Check-in confirmation email
- Check-out receipt email
- Scheduled overdue status updates

Duplicate sends are prevented using flags:
- `checkInEmailSent`
- `checkOutEmailSent`

---

## Security Design

Firestore rules enforce:

- Authenticated access required
- Role-based write permissions
- Field-restricted updates using `changedKeys()`
- Active account verification
- Archive and logs separated from operational data

---

## Engineering Highlights

- Multi-document write workflow handling
- Defensive programming against partial failures
- Real-time UI synchronization
- Secure Firestore rule design
- Cloud-triggered automation
- Permission-denied debugging & resolution

---

## Database Structure
users/
guests/
archivedGuests/
rooms/
payments/
logs/
settings/

---

## Edge Cases Handled

✔ Double check-out attempts  
✔ Permission-denied schema conflicts  
✔ Duplicate email triggers  
✔ Invalid stay duration  
✔ Missing room references  
✔ Negative balance protection  
✔ Overdue automation  

---

## Local Setup

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run dev

Firebase Setup

1. Create a Firebase project in the Firebase Console
2. Enable:
  - Firestore Database
  - Firebase Authentication
3. Deploy Firestore security rules
4. Deploy Cloud Functions:
    firebase deploy --only functions
5. Configure SendGrid secret:
    firebase functions:secrets:set SENDGRID_API_KEY
```

## Portfolio Value
This project demonstrates:
  - Full-stack system architecture
  - Secure backend rule design
  - Role-based authorization
  - Real-time state management
  - Cloud-triggered automation
  - Complex workflow handling
  - Production-style defensive programming

## License

This project is licensed under the MIT License.
See the LICENSE file for details.