const express = require('express');
const TempEmail = require('../models/TempEmail');
const axios = require('axios');

const router = express.Router();

// Available domains for temporary emails (using 1secmail domains)
const availableDomains = [
  '1secmail.com',
  '1secmail.org',
  '1secmail.net',
  'kzccv.com',
  'qiott.com',
  'uuf.me',
  '1secmail.xyz'
];

// 1secmail API base URL
const SECMAIL_API_BASE = 'https://www.1secmail.com/api/v1/';

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Temp Email route is working!' });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Temp email routes are working',
    timestamp: new Date().toISOString()
  });
});

// Generate temporary email using 1secmail API
router.post('/generate', async (req, res) => {
  try {
    const { customUsername, domain } = req.body;
    
    // Generate random username if not provided
    const username = customUsername || `temp${Math.random().toString(36).substring(2, 10)}`;
    const selectedDomain = domain || '1secmail.com';
    const email = `${username}@${selectedDomain}`;

    // Create email in our database
    const tempEmail = new TempEmail({
      email,
      username,
      domain: selectedDomain,
      apiProvider: '1secmail'
    });

    await tempEmail.save();

    res.json({
      success: true,
      message: 'Temporary email generated successfully',
      data: {
        email: tempEmail.email,
        username: tempEmail.username,
        domain: tempEmail.domain,
        expiresAt: tempEmail.expiresAt,
        messagesCount: 0,
        isReal: true,
        apiProvider: '1secmail'
      }
    });

  } catch (error) {
    console.error('❌ Temp email generation error:', error);
    res.status(500).json({ error: 'Failed to generate temporary email' });
  }
});

// Get email messages from 1secmail API
router.get('/:email/messages', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Check if email exists in our database
    const tempEmail = await TempEmail.findOne({ 
      email,
      expiresAt: { $gt: new Date() }
    });

    if (!tempEmail) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }

    // Parse email to get username and domain
    const [username, domain] = email.split('@');
    
    // Fetch messages from 1secmail API
    const apiUrl = `${SECMAIL_API_BASE}?action=getMessages&login=${username}&domain=${domain}`;
    
    try {
      const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
      const messages = apiResponse.data || [];

      // Transform API messages to our format
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        body: msg.body || '',
        html: msg.html || '',
        receivedAt: new Date(msg.date),
        read: false
      }));

      // Update our database with new messages
      tempEmail.messages = transformedMessages;
      await tempEmail.save();

      res.json({
        success: true,
        data: {
          email: tempEmail.email,
          expiresAt: tempEmail.expiresAt,
          messages: transformedMessages.sort((a, b) => b.receivedAt - a.receivedAt),
          apiProvider: '1secmail'
        }
      });

    } catch (apiError) {
      console.error('❌ 1secmail API error:', apiError.message);
      
      // Fallback to database messages if API fails
      res.json({
        success: true,
        data: {
          email: tempEmail.email,
          expiresAt: tempEmail.expiresAt,
          messages: tempEmail.messages.sort((a, b) => b.receivedAt - a.receivedAt),
          apiProvider: '1secmail',
          apiError: 'Using cached messages'
        }
      });
    }

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get specific email content from 1secmail API
router.get('/:email/messages/:messageId', async (req, res) => {
  try {
    const { email, messageId } = req.params;
    
    const [username, domain] = email.split('@');
    
    // Fetch specific message from 1secmail API
    const apiUrl = `${SECMAIL_API_BASE}?action=readMessage&login=${username}&domain=${domain}&id=${messageId}`;
    
    const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
    const message = apiResponse.data;

    res.json({
      success: true,
      data: {
        id: message.id,
        from: message.from,
        subject: message.subject,
        body: message.body || '',
        html: message.html || '',
        receivedAt: new Date(message.date),
        attachments: message.attachments || []
      }
    });

  } catch (error) {
    console.error('❌ Get message content error:', error);
    res.status(500).json({ error: 'Failed to get message content' });
  }
});

// Simulate receiving an email (for testing)
router.post('/:email/simulate', async (req, res) => {
  try {
    const { email } = req.params;
    const { from, subject, body } = req.body;
    
    const tempEmail = await TempEmail.findOne({ 
      email,
      expiresAt: { $gt: new Date() }
    });

    if (!tempEmail) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }

    const simulatedMessage = {
      from: from || 'noreply@example.com',
      subject: subject || 'Test Email',
      body: body || 'This is a simulated email message for demonstration purposes.',
      html: `<p>${body || 'This is a simulated email message for demonstration purposes.'}</p>`,
      receivedAt: new Date()
    };

    tempEmail.messages.push(simulatedMessage);
    await tempEmail.save();

    res.json({
      success: true,
      message: 'Email simulated successfully',
      data: simulatedMessage
    });

  } catch (error) {
    console.error('❌ Simulate email error:', error);
    res.status(500).json({ error: 'Failed to simulate email' });
  }
});

// Simulate external emails (for testing)
router.post('/:email/simulate-external', async (req, res) => {
  try {
    const { email } = req.params;
    
    const tempEmail = await TempEmail.findOne({ 
      email,
      expiresAt: { $gt: new Date() }
    });

    if (!tempEmail) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }

    const externalEmails = [
      {
        from: 'noreply@github.com',
        subject: 'Verify your GitHub account',
        body: 'Click the link below to verify your GitHub account: https://github.com/verify/abc123',
        html: '<p>Click the link below to verify your GitHub account:</p><p><a href="https://github.com/verify/abc123">Verify Account</a></p>',
        receivedAt: new Date()
      },
      {
        from: 'welcome@discord.com',
        subject: 'Welcome to Discord!',
        body: 'Thanks for joining Discord! Your verification code is: 123456',
        html: '<h2>Welcome to Discord!</h2><p>Thanks for joining Discord!</p><p>Your verification code is: <strong>123456</strong></p>',
        receivedAt: new Date()
      },
      {
        from: 'security@twitter.com',
        subject: 'Confirm your Twitter account',
        body: 'Please confirm your Twitter account by clicking this link: https://twitter.com/confirm/xyz789',
        html: '<p>Please confirm your Twitter account:</p><p><a href="https://twitter.com/confirm/xyz789">Confirm Account</a></p>',
        receivedAt: new Date()
      }
    ];

    const randomEmail = externalEmails[Math.floor(Math.random() * externalEmails.length)];
    tempEmail.messages.push(randomEmail);
    await tempEmail.save();

    res.json({
      success: true,
      message: 'External email simulated successfully',
      data: randomEmail
    });

  } catch (error) {
    console.error('❌ Simulate external email error:', error);
    res.status(500).json({ error: 'Failed to simulate external email' });
  }
});

// Get available domains
router.get('/domains', (req, res) => {
  res.json({
    success: true,
    data: availableDomains
  });
});

module.exports = router;
