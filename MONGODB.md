# MongoDB Docker Commands

## Quick Reference

### Start MongoDB
```bash
sudo docker run -d --name ecom-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ecom mongo:7
```

### Check MongoDB Status
```bash
sudo docker ps | grep ecom-mongodb
```

### Stop MongoDB
```bash
sudo docker stop ecom-mongodb
```

### Start MongoDB (if already created)
```bash
sudo docker start ecom-mongodb
```

### Restart MongoDB
```bash
sudo docker restart ecom-mongodb
```

### Remove MongoDB Container
```bash
sudo docker stop ecom-mongodb
sudo docker rm ecom-mongodb
```

### View MongoDB Logs
```bash
sudo docker logs ecom-mongodb
```

### Access MongoDB Shell
```bash
sudo docker exec -it ecom-mongodb mongosh
```

### MongoDB Shell Commands
```javascript
// Show databases
show dbs

// Use ecom database
use ecom

// Show collections
show collections

// View all users
db.users.find()

// View users with formatted output
db.users.find().pretty()

// Count users
db.users.countDocuments()

// Find specific user
db.users.findOne({ email: "test@example.com" })

// Delete a user
db.users.deleteOne({ email: "test@example.com" })

// Delete all users
db.users.deleteMany({})

// Exit shell
exit
```

## Backup & Restore

### Backup Database
```bash
sudo docker exec ecom-mongodb mongodump --db=ecom --out=/dump
sudo docker cp ecom-mongodb:/dump ./mongo-backup
```

### Restore Database
```bash
sudo docker cp ./mongo-backup ecom-mongodb:/dump
sudo docker exec ecom-mongodb mongorestore --db=ecom /dump/ecom
```

## Troubleshooting

### MongoDB Won't Start
```bash
# Check if port 27017 is already in use
sudo lsof -i :27017

# Remove existing container
sudo docker rm -f ecom-mongodb

# Start fresh container
sudo docker run -d --name ecom-mongodb -p 27017:27017 mongo:7
```

### Can't Connect from Backend
```bash
# Verify MongoDB is running
sudo docker ps | grep ecom-mongodb

# Check MongoDB logs
sudo docker logs ecom-mongodb

# Test connection
mongosh mongodb://localhost:27017/ecom
```

### Database Persistence
By default, data is stored inside the container. For persistent data:
```bash
sudo docker run -d \
  --name ecom-mongodb \
  -p 27017:27017 \
  -v ~/mongodb-data:/data/db \
  mongo:7
```

## Useful Queries

### View Recent Users
```javascript
db.users.find().sort({ createdAt: -1 }).limit(5)
```

### Count Users by Role
```javascript
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

### Find Users Created Today
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
db.users.find({ createdAt: { $gte: today } })
```

### Update User Role
```javascript
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)
```

## Production Notes

1. **Use MongoDB Atlas** for production (managed service)
2. **Enable authentication** for Docker MongoDB:
   ```bash
   sudo docker run -d \
     --name ecom-mongodb \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=yourpassword \
     mongo:7
   ```
3. **Regular backups** are essential
4. **Monitor performance** with MongoDB tools
5. **Set resource limits** for Docker container
