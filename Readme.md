
# SyncUP

SyncUp is a comprehensive task management system where all tasks, from backlog ,todo , review are there providing complete visibility and enhances productivity of team. implementing a clear prioritization framework based on objectives and deadlines to ensure focus on most of the critical tasks task management system enable better allocation of recourses by providing insights pf workload distribution better decision making it provides transparency that what task is in status what is in running can analyze task progress , identify bottlenecks.


## Tech Stack

**UI Frameworks:** next.js, MUI, TailwindCSS

**Database:** PostgreSQL

**AUTH:** next auth

**State management:** Redux flux/Redux saga

**API Communication:** Saga

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

Initial Prisma Setup Guide::

```
npx prisma generate
npx prisma init
npx prisma db push
npx prisma studio
```

### 5. Environment Variables

To run this project, you will need to set up the following environment variables in a `.env` file in the root of your project directory.

#### Example `.env` File
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
AUTH_SECRET="dummyAuthSecret12345"
BCRYPT_SALT=10
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="dummyGoogleClientSecret12345"
SENDGRID_API_KEY="SG.dummySendGridApiKey12345"
SENDGRID_SMTP_EMAIL="automation@example.com"
NEXTAUTH_URL="http://localhost:3000"
JWT_USER_ID_SECRET="dummyJwtUserIdSecret12345"
AWS_S3_ACCESS_KEY_ID="dummyAwsS3AccessKeyId12345"
AWS_S3_SECRET_ACCESS_KEY="dummyAwsS3SecretAccessKey12345"
AWS_S3_REGION="dummy-region-1"
AWS_S3_BUCKET_NAME="dummy-bucket-name"
NEXT_PUBLIC_ENVIRONMENT='dev'
PROD_DOMAIN="https://dummy-prod-domain.com"

```

1. **Database (PostgreSQL)**
   - **DATABASE_URL**: 
     - Create a PostgreSQL user with a secure password.
     - Create a PostgreSQL database.
     - Format: `postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public`

2. **Authentication Secret**
   - **AUTH_SECRET**: Generate a strong secret. You can use the following command to generate a random string:
     ```
     sh openssl rand -base64 32
     ```
   - **Example:** `dummyAuthSecret12345`

3. **Bcrypt Salt Rounds**
   - **BCRYPT_SALT**: Typically set to `10`.

4. **Google OAuth Credentials**
   - **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**:
     - Create a project in the [Google Developer Console](https://console.developers.google.com/).
     - Enable OAuth 2.0 and configure the OAuth consent screen.
     - Create OAuth credentials to obtain the Client ID and Client Secret.

5. **SendGrid API Key**
   - **SENDGRID_API_KEY**: 
     - Sign up at [SendGrid](https://sendgrid.com/).
     - Create an API key under "API Keys" in the dashboard.
   - **SENDGRID_SMTP_EMAIL**: The email address you plan to use for sending emails.

6. **NextAuth URL**
   - **NEXTAUTH_URL**: Set this to the base URL of your application, e.g., `http://localhost:3000` for local development.

7. **JWT Secret**
   - **JWT_USER_ID_SECRET**: Generate a strong secret using the same method as for the AUTH_SECRET.

8. **AWS S3 Credentials**
   - **AWS_S3_ACCESS_KEY_ID** and **AWS_S3_SECRET_ACCESS_KEY**:
     - Create a new IAM user in the [AWS Management Console](https://aws.amazon.com/console/) with programmatic access and S3 full access permissions.
   - **AWS_S3_REGION**: The region where your S3 bucket is located (e.g., `us-east-1`).
   - **AWS_S3_BUCKET_NAME**: Create an S3 bucket and note its name.

9. **Environment Indicator**
   - **NEXT_PUBLIC_ENVIRONMENT**: Set to `'dev'` for development.

10. **Production Domain**
    - **PROD_DOMAIN**: Set to your production domain URL.

### 6. Run the App

Run this App using:
```
cd app
npm run dev
```

The app is now running, navigate to http://localhost:3000/ in your browser to explore its UI.

