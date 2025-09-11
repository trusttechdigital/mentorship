// middleware/audit.js
const { AuditLog } = require('../models');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after successful response
      if (res.statusCode < 400) {
        AuditLog.create({
          userId: req.user?.id,
          action,
          resource,
          resourceId: req.params.id || req.body.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }).catch(console.error);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLog;
