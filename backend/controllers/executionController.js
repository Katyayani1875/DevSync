const { executeCode } = require('../utils/executionService');

exports.execute = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({
        error: 'Both code and language parameters are required'
      });
    }

    const result = await executeCode(code, language);
    return res.json(result);
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({
      error: 'Failed to execute code',
      details: error.message
    });
  }
};