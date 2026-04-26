import { updateLead, getLeadById, deleteLead } from '../_lib/firestore-service.js';
import { verifyIdToken } from '../_lib/firebase-admin.js';

// Fields allowed for admin updates
const ADMIN_UPDATE_FIELDS = ['name', 'email', 'phone', 'status', 'notes'];
// Fields allowed for unauthenticated self-updates (test-ride flow)
const PUBLIC_UPDATE_FIELDS = ['name', 'phone', 'quizAnswers'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Lead ID required' });
  }

  try {
    // Handle updates via POST or PATCH
    if (req.method === 'POST' || req.method === 'PATCH') {
      const token = req.headers.authorization?.split('Bearer ')[1];

      // Unauthenticated POST: allow limited self-updates (test-ride flow)
      if (!token) {
        const lead = await getLeadById(id);
        if (!lead) {
          return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        const updateData = {};
        PUBLIC_UPDATE_FIELDS.forEach(field => {
          if (field in req.body) {
            updateData[field] = req.body[field];
          }
        });

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        const updatedLead = await updateLead(id, updateData, { skipExistenceCheck: true });
        return res.status(200).json({ success: true, lead: updatedLead });
      }

      // Authenticated update: admin or lead owner
      let user;
      try {
        user = await verifyIdToken(token);
      } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      const lead = await getLeadById(id);
      if (!lead) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      const isAdmin = user.admin === true;
      const isOwner = lead.userId === user.uid;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const updateData = {};
      ADMIN_UPDATE_FIELDS.forEach(field => {
        if (field in req.body) {
          updateData[field] = req.body[field];
        }
      });

      const updatedLead = await updateLead(id, updateData, { skipExistenceCheck: true });
      return res.status(200).json({ success: true, lead: updatedLead });
    }

    // Checking if we should support GET for single lead (Admin)
    if (req.method === 'GET') {
      // Validate and extract Authorization header
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Verify token and get user
      let user;
      try {
        user = await verifyIdToken(token);
      } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      // Fetch lead
      const lead = await getLeadById(id);
      if (!lead) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      // Check authorization (admin or lead owner)
      const isAdmin = user.admin === true;
      const isOwner = lead.userId === user.uid;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      return res.status(200).json({ success: true, lead });
    }

    // Handle DELETE
    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      let user;
      try {
        user = await verifyIdToken(token);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      // Only admins can delete
      const isAdmin = user.admin === true;
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await deleteLead(id);
      return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
    }

    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
