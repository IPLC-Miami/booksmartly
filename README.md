
## Introduction

**BookSmartly** is a **smart and accessible** clinician appointment platform that **bridges healthcare gaps** for **underserved communities** by reducing wait times and streamlining scheduling. It helps patients **connect with clinicians effortlessly** while enabling **efficient queue management** in hospitals and clinics. Powered by **Supabase**, BookSmartly ensures **secure authentication, real-time syncing, and seamless healthcare access**.

🌐 **Deployed Project Link** -  [https://aryamagarwal.github.io/BookSmartly](https://aryamagarwal.github.io/BookSmartly)

**BookSmartly FeedBack Form** - [https://forms.gle/7jNscB3c7jUewsaX7](https://forms.gle/7jNscB3c7jUewsaX7)

## Index
- [Application Testing Guide](#application-testing-guide)
  - [Login Credentials for Testing Clinician Dashboard](#login-credentials-for-testing-clinician-dashboard)
  - [Specializations Available in Database](#specializations-available-in-database)
  - [Notes:](#notes)
  - [Patient Dashboard Testing Guide](#patient-dashboard-testing-guide)
  - [Reception Dashboard Testing Guide](#reception-dashboard-testing-guide)
  - [Health Worker Dashboard Testing Guide](#health-worker-dashboard-testing-guide)
  - [Screenshots](#screenshots)
  - [](#)
  - [Redis Integration](#redis-integration)
    - [1. Installation (Ubuntu 24.04)](#1-installation-ubuntu-2404)
    - [2. Configuration](#2-configuration)
    - [3. Environment Variables](#3-environment-variables)
    - [4. Redis Client (`backend/config/redisClient.js`)](#4-redis-client-backendconfigredisclientjs)
    - [5. Caching Example (User Role Lookup)](#5-caching-example-user-role-lookup)


## Features and Functions

### 1. Sign-Up and Login

- Users receive an **email verification link** upon sign-up.
- After verification, they can log in using **email-password authentication**.
- **Role-based access control (RBAC)** for patients and clinicians.
- Secure session handling via **Supabase Auth**.
- Post-login redirection to the **profile dashboard** for additional details.
- **Forgot Password** feature for secure password recovery.

### 2. Booking Appointment

Booking an appointment follows a structured **multi-step process** ensuring accuracy and an optimized workflow.

#### **Personal Details**

- Users input **key personal details** such as **name, age, gender, address, and health issue**.
- **Geolocation API integration** for fetching the user's **current location**.

#### **AI-Powered Clinician Specialization Suggestion**

- **AI-driven model** dynamically determines the **most suitable clinician specialization** based on user symptoms.
- Uses **TF-IDF** vectorization and a **Random Forest classifier** to analyze user input.
- Preprocessing techniques like emoji removal, spell correction (TextBlob), and stopword removal (NLTK) enhance input quality.
- If confidence is low, the ML model predicts the specialist with probability-based classification.

#### **Slot Selection**

- **Automated dynamic slot generation** based on real-time clinician availability.
- **Real-time slot updates** to **prevent double booking**, powered by **Supabase**.
- **Date picker** for selecting the consultation date.
- Displays **clinician profiles** with expertise tags, enabling users to make informed decisions.

#### **Review Booking**

- Users can **verify all appointment details** before finalizing the booking.
- **Editable appointment flow**, allowing users to revise selections before confirmation.
- **Future-proof payment gateway integration** for seamless transactions.

### 3. Patient Dashboard

The **Patient Dashboard** provides users with a centralized interface to manage appointments and profile details.

#### **Profile Section**

- Users can **update and manage** their **personal details**.
- **Profile image upload** functionality for enhanced personalization.

#### **Scheduled Appointments**

- Displays **real-time queue status** with an estimated consultation time.
- Option to **cancel scheduled appointments** as needed.

#### **Appointment History**

- Comprehensive record of previous consultations.
- Access to **digital prescriptions and clinician notes**.

### 4. Clinician Dashboard

The **Clinician Dashboard** provides an intelligent scheduling system for healthcare professionals.

#### **Profile Section**

- Clinicians can **view** their **specialization, availability, and clinic details**.
- Profile updates are **restricted to administrators** to maintain data integrity.

#### **Live Queue Management**

- **Real-time queue visualization** for efficient patient flow management.
- Clinicians can mark patient statuses as **checked-in, completed, or skipped**.

##### **Skipping an Appointment**

- Clinicians can **skip an appointment** if a patient is unavailable or late.
- **Automated queue updates** notify the **next patient** in line.

##### **OTP Verification**

- **Secure OTP-based authentication** ensures **correct patient identification** before consultation.

#### **History**

- Maintains a **log of all past consultations**, including patient details.
- Allows clinicians to **review and manage prescriptions and notes**.

### 5. Dynamic Queue Updates

- **Instant queue synchronization** using **Supabase real-time database**.
- **Future enhancement**: Instant patient notifications when their turn approaches.
- **Redis-based caching** for efficient queue management, enhancing scalability and responsiveness.

### 6. AI-Powered Chatbot

- **Retrieval-Augmented Generation (RAG)-based chatbot** for dynamic retrieval of medical knowledge.
- Uses **Faiss** with **Sentence Transformers** for fast and accurate FAQ retrieval based on user queries.
- Ensures **precise and personalized medical guidance**.
- Supports real-time interaction via a **FastAPI**-powered backend.

### 7. Machine Learning Integration

- **AI-assisted diagnostic insights** for **symptom-based clinician recommendations**.
- **Predictive analytics** for optimized appointment scheduling.

### 8. Reminder System

- **Automated email and SMS reminders** for upcoming consultations.

### 9. Online Prescriptions

- Clinicians can **generate, upload, and digitally sign prescriptions**.
- Patients can **securely access and download prescriptions** from their dashboard.

### 10. Feedback System

- Patients can **submit structured feedback** for clinicians.
- **AI-driven sentiment analysis** extracts **meaningful insights from patient feedback** using **DistilBERT** and **Sentence Transformers**.
- Uses precomputed embeddings for efficient similarity matching and tagging.
- Dynamically generates relevant expertise tags for clinician profiles based on **semantic similarity (Faiss)** and **keyword-based classification**.
- Enhances **user experience and service optimization**.
  
### 11. Reception Dashboard

 - Displays a unique QR code that patients can scan using their mobile devices to quickly check in upon arrival at the health facility.
 - Continuously monitors and displays the queue status, showcasing the next four patients scheduled for consultation with each clinician.
 - Facilitates streamlined coordination between patients and healthcare providers by keeping reception staff informed of current and upcoming appointments.

### 12. Health Worker Dashboard

  - Enables health workers and NGOs to perform preliminary health checkups and log citizen complaints, which can be escalated to relevant authorities or healthcare professionals for timely action.
  - Provides tools to organize and manage free health camps, allowing workers to schedule events, assign roles, and track participation.
  - Allows clinicians to volunteer for health camps and coordinate directly with health workers for event planning and patient support.


---

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Supabase (**PostgreSQL, Authentication, Real-time Database**), Node.js, Express.js, FastAPI
- **Machine Learning:** Python, Faiss, Sentence Transformers, Scikit-learn, Hugging Face Transformers, NLTK, TextBlob
- **Authentication:** Supabase Auth
- **Caching & Performance:** Redis for **high-speed data retrieval and scalability**
- **Data Fetching & State Management:** **TanStack React Query** for optimized client-server synchronization
- **Email Services:** Nodemailer for **automated email handling, including OTP-based authentication**
- **Deployment:** GitHub Pages, Render

---

## Implementation Flowchart

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/b6b6d89e-f7a1-4d7f-aa79-5382561ca713">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/7c92b78d-f08c-4266-beb2-d9f782400d08">
  <img src="https://github.com/user-attachments/assets/b6b6d89e-f7a1-4d7f-aa79-5382561ca713" alt="My Image">
</picture>

---
## Continuous Improvement

### 1) Managing Clinician Absences
- Each clinician has 5 buffer slots for emergencies.
- Patients can:
  - Choose another available clinician.
  - Reschedule their appointment.

### 2) MBBS Intern Contributions
- Interns assist with minor cases via online consultations.
- Provides hands-on experience under supervision.

### 3) Secure Payment System
- Integrate payment gateway for smooth transactions and overall application robustness.

These upgrades enhance efficiency, patient experience, and overall system effectiveness.

---
## Conclusion

BookSmartly **revolutionizes clinician appointment booking** with a **high-performance, AI-powered, and real-time platform** designed for both **patients and clinicians**. Utilizing **Supabase for real-time updates, authentication, and secure data management**, BookSmartly ensures **seamless reliability and ease of use**. With **ML-driven clinician recommendations, intelligent queue management, Redis caching for scalability, and digital prescriptions**, BookSmartly stands as a **cutting-edge solution improving healthcare accessibility and efficiency**.  


---

# Application Testing Guide

## Login Credentials for Testing Clinician Dashboard
Use the following clinician accounts to log in and test the application:

| Clinician Email            | Password      |
|----------------------------|--------------|
| clinician1@example.com       | password123  |
| clinician2@example.com       | password123  |
| clinician3@example.com       | password123  |
| clinician4@example.com       | password123  |
| clinician5@example.com       | password123  |
| clinician6@example.com       | password123  |
| clinician7@example.com       | password123  |
| clinician8@example.com       | password123  |
| clinician9@example.com       | password123  |
| clinician10@example.com      | password123  |



## Specializations Available in Database
Currently, the following clinician specializations are available in the database:

- Dermatologist
- Pediatrician
- Cardiologist
- Psychiatrist
- Orthopedic
- Neurologist
- Gynecologist
- Urologist
- ENT (Ear, Nose, Throat Specialist)
- General Physician

## Notes:
- The clinician data in the database is for **testing purposes only**.
- The **ML model** can map clinicians to a **variety of other specializations** beyond those currently available in the database.


## Patient Dashboard Testing Guide

- Patients can sign up using their email ID.
- After email verification, they can log in and follow the booking workflow.
- Patients can edit their profile details, including name, age, and contact information.
- They can book, view and cancel appointments from their dashboard.
- Patients can access their medical history and view prescriptions and clinician's remarks (if any).

## Reception Dashboard Testing Guide
| Reception Email            | Password     |
|----------------------------|--------------|
|  reception1@example.com    |reception123  |

## Health Worker Dashboard Testing Guide
| Health Worker Email        | Password     |
|----------------------------|--------------|
|healthworker1@example.com   |  HEALTH123   |


## Screenshots

<img width="800" alt="Screenshot 2025-04-03 at 11 09 53 PM" src="https://github.com/user-attachments/assets/977fb1d5-a749-498c-8c28-6991e9d3e6ac" /><br>

- **Login**<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 00 05 PM" src="https://github.com/user-attachments/assets/0dc51343-70b4-4f38-8c39-f1a02c31b637" /><br>
<br><br>
- **SignUp**
- <img width="800" alt="Screenshot 2025-04-03 at 11 00 05 PM" src="https://github.com/user-attachments/assets/1c5bb870-6a5d-4f8a-99d7-a25f2e4e7305" /><br>
<br><br>
**Forgot Password**
- <img width="800" alt="Screenshot 2025-04-03 at 11 00 05 PM" src="https://github.com/user-attachments/assets/19ff4940-0f80-4a46-83f3-c152070e12fc" /><br>
<br><br>
**Verification Page**
- <img width="800" alt="Screenshot 2025-04-03 at 11 00 05 PM" src="https://github.com/user-attachments/assets/a0c209a0-03cd-485a-bab0-43a373d6c886" /><br>
<br><br>
- **Patient Dashboard**
    - Profile<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/5860d191-2b65-4e08-ba5b-53ecdee5511f" /><br>
The profile tab provides users with a detailed view of their personal information, including fields such as `email`, `phone`, `address`, `age`, and `gender`.  
Additionally, it displays any appointments scheduled for the current day, helping users stay updated on their schedule.  
This section ensures easy access to essential details while keeping track of upcoming consultations.  
    - Upcoming Booked Appointments<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/0dc1a1ee-cd04-40b7-8fa9-b9776baf9d80" /><br>
The **Upcoming Appointments** section displays all scheduled appointments, providing users with essential details such as **`clinician’s name`, `specialization`, `hospital`, `address`, `expected time`, `appointment date`, and `queue position`.  
In case of an emergency or change of plans, users have the option to **cancel their appointment** directly from this section. Additionally, a **QR code check-in system** is available, allowing users to seamlessly check in at the reception by scanning the **QR code displayed on the reception dashboard**.  
    -Past Appointments(History)<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/6056aa1d-1f35-40eb-a80a-2d5a3525416f" /><br>
The **Appointment History** section provides users with a record of their past appointments, displaying key details such as `clinician’s name`, `specialization`, `hospital`, `address`,` appointment time`, and `date`.  
To enhance user experience, this section includes a **feedback feature**, allowing patients to share their experiences and provide insights for service improvement. Additionally, users can access **detailed information** about their past consultations for future reference.  

<br><br>
- **Clinician Dashboard**
    - Profile<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/004a3c48-6b90-42c0-844e-80e1f625c077" /><br>
The **Clinician Profile** section provides essential details about the clinician, including `email`, `phone`, `address`, `specialization`, `age`, and `gender`. This information ensures easy access for patients and staff, facilitating smooth communication and coordination.  Additionally, this section includes a **"Download Today's Appointments"** button, allowing clinicians to efficiently access a list of scheduled appointments for the day. This feature helps in managing consultations effectively and staying organized.  
    - Excel Sheet for Displaying Current Appointments<br>
  <img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/e65a52a0-5bfe-43fb-b5ae-164fba94adb7" /><br>
  Clinicians can **download a backup** of all scheduled appointments for the day to handle patient queues during **power failures or system downtimes**. The downloaded file includes **patient details, appointment status, clinician, and specialization**, allowing reception staff to **manually manage check-ins** without system access. This ensures **uninterrupted workflow** and prevents delays in patient care. The backup can be **manually triggered or auto-scheduled** for reliability.
    - Appointments Queue<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/6ad52e80-a71b-40d5-b100-f6a0e94305e0" /><br>
The **Appointment Queue** section displays a list of patients waiting for their appointments, providing key details such as `patient name`, `age & gender`, `hospital`, `expected appointment time`, `appointment date`, and `queue position`.  Each patient entry includes action buttons for **"Skip"**, **"OTP Verification"**, and **"Details"**, enabling clinicians to manage the queue efficiently. The OTP verification ensures secure patient identification, while the queue system helps streamline patient flow and reduce wait times.  

    -Past Appointments(History)<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/27c115fa-e51d-482e-8394-2b34217eacdd" /><br>
The **Appointment History** section provides a record of past patient consultations, displaying key details such as `patient name`, `age & gender`, `issue`, `hospital`, `appointment time`, and `appointment date`. Each entry allows doctors to review past interactions and track patient history for better follow-ups and continuity of care. A **"Details"** button is available for accessing more in-depth information about the appointment.  

<br><br>
- **Reception  Dashboard**
    - Profile<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/ab7357be-fd57-42ea-9bec-daf1a8d5e02b" /><br>
The **Reception Profile** section provides essential details about the hospital, including `hospital name`, `address`, and `email`, ensuring easy access to contact information.  A **QR Code** is displayed, which patients need to scan for check-in upon arrival. The `current code` shown beneath the QR code ensures secure and efficient authentication for patients, streamlining the check-in process and reducing manual efforts at the reception.  
    - Real time Queue Monitoring<br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/91748dd2-88fa-4db2-b10a-f5f7342e857d" /><br>
The **Reception Dashboard** provides real-time insights into patient queues and doctor availability, using **WebSockets** for instant updates. It displays `total patients`, `active doctors`, `current time`, and the `last updated timestamp`, with a `refresh button` for manual updates. Each doctor has a queue status card showing their `name`, `profile icon`, `patient count`, and `queue status` (e.g., "No patients," "Active," or "Busy"). A `queue list` with patient names and positions appears if applicable, and doctors with no patients see a `"Clear" button` to reset their status. **WebSockets** enable automatic updates, ensuring patient check-ins via QR codes, doctor availability, and queue status changes reflect in real time, reducing delays and improving efficiency. 
<br><br>

- **Booking Process and AI-Powered Clinician Specialization Suggestion**
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/2202309b-7c9e-4365-ac1f-a7cbc5a161c7" /><br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/10d8c970-4dc2-44f6-bb70-b1e1ba08d0c5" /><br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/037de507-062d-47e8-857c-f6d54e60ecaf" /><br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/2dd0305f-3f23-44dd-a36c-250d2eb3b888" /><br>
<img width="800" alt="Screenshot 2025-04-03 at 11 24 35 PM" src="https://github.com/user-attachments/assets/705dff6c-d116-4f8c-8401-80c74091e4e5" /><br>
<br><br>

- **Prescription Process**
- Clinician Dashboard Appointments<br>
![11)DoctorDashboard_Queue](https://github.com/user-attachments/assets/99697269-4a29-43b4-a9b8-9736519ccc39)<br>
Doctor Views his current days schedule and confirms the presence of the patient by using OTP verification(only if the patient has not checked in) then the patient recieves the OTP 
- Patient recieving OTP<br>
![13)Docotr_dashboard_Otp_Verification](https://github.com/user-attachments/assets/a677846e-1f2f-45f1-a861-b861887c6f97)<br>
- Doctor giving prescription<br>
![14)Doctor_Dashbaord_Prescription](https://github.com/user-attachments/assets/4818cd10-f72f-415e-bee5-99f9c85dd46a)<br>
Doctors provide prescriptions by filling out the following fields: **Doctor Remarks**, where they note the patient's condition, and **Medical Prescription**, where they list recommended medications. The prescription follows a structured format, ensuring clarity for both patients and pharmacists.  

- **Patient Feedback Process** 
- Patient Dashboard History<br>
  -  ![15)Patient_Dashboard_History](https://github.com/user-attachments/assets/c9b2a32d-b35c-4dc0-9310-fd534fe610bd)<br>
  Patients can **view their past appointments** along with details such as the **doctor's name, specialization, hospital, address, appointment date, and time**. They also have the option to **provide feedback** on their experience, helping improve healthcare services. Additionally, a **"Get Directions"** feature assists patients in locating the hospital easily.  


- Patient Feedback Portal<br>
  -  ![16)Patient_Feedback](https://github.com/user-attachments/assets/4fab670a-e89e-4230-863a-940f7f0e2493)<br>
  Users can provide feedback on their past medical appointments by clicking the **Feedback** button in the **History** tab. A popup appears where they can enter their experience with the doctor and treatment. They can then submit the feedback by clicking **Send** or cancel it if needed. This feature helps improve healthcare services based on patient reviews.  

-AI generated Tag of the feedback displayed over the doctor profile<br>
  -  ![17)Doctor_Dashboard_feedback_summary](https://github.com/user-attachments/assets/6b7252e0-cf5b-4974-83fa-48eecb2389f3)<br>
  User feedback is processed using an ML model to generate concise tags summarizing key aspects of the doctor’s service. These tags, such as "Helpful" or "Experienced," are displayed on the doctor’s profile when patients select a doctor and time slot. This helps patients make informed decisions based on past experiences of previous doctors.
<br><br>

- **FAQ Chatbot**
<img width="800" alt="Screenshot 2025-04-03 at 11 15 30 PM" src="https://github.com/user-attachments/assets/55b5414c-ddac-4cae-9e91-1788079b8284" />
---


---

## Redis Integration

### 1. Installation (Ubuntu 24.04)

```bash
sudo apt update
sudo apt install redis-server -y
```

### 2. Configuration

Edit `/etc/redis/redis.conf`:

```conf
bind 127.0.0.1
requirepass YOUR_STRONG_PASSWORD_HERE 
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:

```bash
sudo systemctl enable redis-server
sudo systemctl restart redis-server
```

Verify connection:

```bash
redis-cli -h 127.0.0.1 -a YOUR_STRONG_PASSWORD_HERE ping
# Should return: PONG
```

### 3. Environment Variables

Add to `backend/.env` (never commit your production password):

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_STRONG_PASSWORD_HERE
```

### 4. Redis Client (`backend/config/redisClient.js`)

```javascript
const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

let redis;
let redisAvailable = false;

if (process.env.REDIS_HOST && process.env.REDIS_PORT && process.env.REDIS_PASSWORD) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    tls: false, // Assuming localhost binding
    // Optional: Add retry strategy, etc.
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
    redisAvailable = true;
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    redisAvailable = false;
  });
} else {
  console.warn('⚠️ Redis not configured - running without caching.');
}

async function getCache(key) {
  if (!redisAvailable || !redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Redis GET error for key ${key}:`, err.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 60) {
  if (!redisAvailable || !redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error(`Redis SET error for key ${key}:`, err.message);
  }
}

module.exports = {
  redis: redisAvailable ? redis : null,
  getCache,
  setCache,
  isRedisAvailable: () => redisAvailable,
};
```

### 5. Caching Example (User Role Lookup)

In `backend/routes/userRoutes.js`, the `/api/users/getRole/:userId` route first checks Redis:

```javascript
// At the top of userRoutes.js
const { getCache, setCache } = require('../config/redisClient');

// Inside the /getRole/:userId handler
const cacheKey = `role:${userId}`;
try {
  const cachedRoleInfo = await getCache(cacheKey);
  if (cachedRoleInfo) {
    return res.json(cachedRoleInfo);
  }
} catch (redisErr) {
  console.error(`Redis GET error for ${cacheKey}:`, redisErr.message);
}

// ... (Supabase lookup logic) ...

// After successful Supabase lookup and before returning response:
if (roleInfo) {
  try {
    await setCache(cacheKey, roleInfo, 60); // Cache for 60 seconds
  } catch (rcErr) {
    console.error(`Redis SET error for ${cacheKey}:`, rcErr.message);
  }
  return res.json(roleInfo);
}
```

If Redis is down or a key is not found, the code gracefully falls back to Supabase.
