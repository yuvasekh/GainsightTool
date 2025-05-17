const axios = require('axios');

exports.fetchTimeLine = async (req, res) => {
  try {
    const { instanceUrl, instanceToken } = req.body;

    if (!instanceUrl || !instanceToken) {
      return res.status(400).json({ message: "Missing instance information" });
    }

    const url = `${instanceUrl}/v1/ant/timeline/search/activity?page=0&size=20`;

    const payload = {
      quickSearch: {},
      contextFilter: {},
      filterContext: "GLOBAL_TIMELINE"
    };

    const config = {
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': instanceToken
      },
      data: JSON.stringify(payload),
      maxBodyLength: Infinity
    };

    const response = await axios(config);
    res.json(response.data);

  } catch (error) {
    console.error("Error fetching timeline:", error.message);
    res.status(500).json({
      message: "Error fetching timeline",
      error: error.message
    });
  }
};
