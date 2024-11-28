
// should be `process.env.JWT_SECRET`, external for this project
// openssl rand -hex 64
const JWT_SECRET = '64e5390436a82dab5afbeb6e928665de346bb7965f91c30c230a16e17e4ad2f6a34cde8af7a0b38c825564c1c8f0d93f677223aecd9874fee3362fc29941374f';

module.exports = { JWT_SECRET };
