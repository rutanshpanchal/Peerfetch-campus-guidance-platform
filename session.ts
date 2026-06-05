{
  "name": "peerfetch-backend",
  "version": "1.0.0",
  "description": "Backend for PeerFetch networking platform",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "seed": "node prisma/seed.js"
  },
  "keywords": ["networking", "mentorship", "students"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "@prisma/client": "^5.7.1"
  },
  "devDependencies": {
    "prisma": "^5.7.1"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
