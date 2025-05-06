const express = require('express');
const cors = require('cors');
const { Client } = require('linkedin-private-api');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-linkedin-message', async (req, res) => {
  const { li_at, jsessionid, profileUrl, messageText } = req.body;

  if (!li_at || !profileUrl || !messageText) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = new Client();

    await client.login.userCookie({
      cookies: {
        li_at,
        JSESSIONID: jsessionid || undefined,
      },
    });

    const publicId = profileUrl.split('/in/')[1].replace('/', '');
    const profile = await client.profile.getProfile({ publicIdentifier: publicId });

    await client.invitation.send({
      profileId: profile.profileId,
      message: messageText,
    });

    return res.json({ success: true, message: 'Invitation sent' });
  } catch (err) {
    console.error('LinkedIn Error:', err);
    return res.status(500).json({ error: 'LinkedIn API failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LinkedIn bot running on port ${PORT}`));
