# MongoDB Setup Instructions

Your backend is currently configured to connect to a local MongoDB instance. You have two options:

## Option 1: Use MongoDB Atlas (Recommended - Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (Free tier is sufficient)
4. Click "Connect" on your cluster
5. Create a database user with username and password
6. Whitelist your IP address (or use 0.0.0.0/0 for development)
7. Copy the connection string
8. Update `backend/.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nivora?retryWrites=true&w=majority
   ```
9. Replace `<username>` and `<password>` with your database credentials
10. Restart the backend server

## Option 2: Install MongoDB Locally

### For Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Install as a Windows Service (recommended)
4. MongoDB will start automatically
5. The current `.env` configuration should work as-is
6. Restart the backend server

### Verify MongoDB is Running:
```powershell
# Check if MongoDB service is running
Get-Service | Where-Object {$_.Name -like "*mongo*"}
```

## Current Configuration

Your backend is set up to store user registrations with the following fields:
- Username (unique)
- Email (unique)
- Password (hashed with bcrypt)
- Full Name
- Avatar (optional)
- Bio (optional)
- Preferences (theme, notifications, currency)
- Timestamps (createdAt, updatedAt)

Once MongoDB is connected, all user registrations will be automatically stored in the database.
