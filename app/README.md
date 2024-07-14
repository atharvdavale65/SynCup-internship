
# SyncUP

SyncUp is a comprehensive task management system where all tasks, from backlog ,todo , review are there providing complete visibility and enhances productivity of team. implementing a clear prioritization framework based on objectives and deadlines to ensure focus on most of the critical tasks task management system enable better allocation of recourses by providing insights pf workload distribution better decision making it provides transparency that what task is in status what is in running can analyze task progress , identify bottlenecks.


## Tech Stack

**UI Frameworks:** next.js, NextUI, TailwindCSS

**Database:** PostgreSQL

**AUTH:** next auth

**State management:** Redux flux/Redux saga

**API Communication:** Prisma

**Deployment:** Vercel


## Getting started

### 1. Clone this Repository

Clone this repository using:

```
git clone https://github.com/positsource/SyncUP.git
```

### 2. Download and install dependencies

Install all npm dependencies::

```
npm i
```

### 3. Prisma Installation

Install prisma::

```
🔗 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
```

### 4. Prisma Setup

Initial Prisma Setup Guide:
- Generate Prisma Client with the following command:
```
npx prisma generate
```
- Next, set up your Prisma ORM project by creating your Prisma schema file with the following command:
```
npx prisma init
```
- Run Prisma Studio, a visual editor for database data:
```
npx prisma studio
```
- Whenever you make changes in Prisma schema run the following command:
```
npx prisma db push
```
### 5. Env File Setup
We have .env file for storing all required credentials.
Enter your credentials in .env file:
```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SMTP_PASSWORD=
SMTP_EMAIL = 
NEXTAUTH_URL=
```
**DATABASE_URL:**
- Enter your database URL which is generally in the form of
```
"postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName"
```
**GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET:**
- Go to the Google Developers Console
- Create project and copy these credentials from there for your project.

**SMTP_PASSWORD,SMTP_EMAIL:** 
- For SMTP_EMAIL enter your mailID.
- For SMTP_PASSWORD generate it from your google accout-->security-->2-step verification-->App password

**NEXTAUTH_URL:** generaly in the form of http://localhost:portnumber/ 


### 6. Run the App

Run this App using::
```
cd app
npm run dev
```

The app is now running, navigate to http://localhost:3000/ in your browser to explore its UI.


