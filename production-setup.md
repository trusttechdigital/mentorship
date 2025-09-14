# Production Environment Setup

This file explains how to set up the production environment for the Mentorship Portal.

## 1. Create the `.env` file

On your production server, you must create a file named `.env` in the root of the project directory. This file contains your production secrets and is not checked into version control for security reasons.

Use the `env.example` file as a template. Copy it to a new file named `.env` and replace the placeholder values with your actual production secrets.

```bash
cp env.example .env
```

Then, edit `.env` with your production values.

## 2. Run the Production Docker Compose

Once the `.env` file is in place, you can start the production environment using the following command:

```bash
./scripts/docker-prod.sh
```

This will build and start the production containers in detached mode.

## 3. Create an Initial Admin User

After the application is running, you need to create the first admin user. You can do this by running the following command on your production server:

```bash
docker compose exec backend node create-admin.js your-email@example.com YourPassword
```

Replace `your-email@example.com` and `YourPassword` with the desired admin credentials.

