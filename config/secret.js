module.exports = {
  database: 'mongodb://root:root@ds157964.mlab.com:57964/ecomm',
  port: 3000,
  secretKey: 'root',
  facebook : {
    clientID: process.env.FACEBOOK_ID || '1571831532854857',
    clientSecret: process.env.FACEBOOK_SECRET || '7dd3c4986b46aa45439bb5e3be6e092d',
    profileFields: ['emails', 'displayName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    enableProof: true
  }
}