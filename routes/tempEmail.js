const express = require('express');
const TempEmail = require('../models/TempEmail');

const router = express.Router();

// Available domains for temporary emails
const availableDomains = [
  '10minutemail.com',
  'tempmail.net',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com'
];

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Temp email routes are working',
    timestamp: new Date().toISOString()
  });
});

// Generate temporary email (now always generates "real" format emails)
router.post('/generate', async (req, res) => {
  try {
    const { customUsername, domain } = req.body;
    
    const username = customUsername || `temp${Math.random().toString(36).substring(2, 10)}`;
    const selectedDomain = domain || 'guerrillamail.com'; // Default to guerrilla mail
    const email = `${username}@${selectedDomain}`;

    // Always create new email (remove duplicate check for simplicity)
    const tempEmail = new TempEmail({
      email,
      username,
      domain: selectedDomain
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
        isReal: true
      }
    });

  } catch (error) {
    console.error('❌ Temp email generation error:', error);
    res.status(500).json({ error: 'Failed to generate temporary email' });
  }
});

// Get email messages
router.get('/:email/messages', async (req, res) => {
  try {
    const { email } = req.params;
    
    const tempEmail = await TempEmail.findOne({ 
      email,
      expiresAt: { $gt: new Date() }
    });

    if (!tempEmail) {
      return res.status(404).json({ error: 'Email not found or expired' });
    }

    res.json({
      success: true,
      data: {
        email: tempEmail.email,
        expiresAt: tempEmail.expiresAt,
        messages: tempEmail.messages.sort((a, b) => b.receivedAt - a.receivedAt)
      }
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Simulate receiving an email
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

// Simulate external emails
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
