const passport = require('passport');
const { FRONTEND_URL } = process.env;

exports.initiateLinkedInDataFetch = (req, res, next) => {
  // Store the return URL in session to redirect back after data fetch
  req.session.returnTo = req.query.returnUrl || `${FRONTEND_URL}/profile`;
  
  passport.authenticate('linkedin-data', {
    scope: ['r_liteprofile', 'r_emailaddress', 'r_basicprofile'],
    state: true,
  })(req, res, next);
};

exports.handleLinkedInDataCallback = async (req, res) => {
  try {
    // The profile data will be available in req.user
    const profileData = {
      experience: req.user?._json?.positions?.values || [],
      education: req.user?._json?.educations?.values || [],
      skills: req.user?._json?.skills?.values || [],
      summary: req.user?._json?.summary || '',
      industry: req.user?._json?.industry || '',
      location: req.user?._json?.location?.name || '',
    };

    // Return URL was stored in session
    const returnUrl = req.session.returnTo || `${FRONTEND_URL}/profile`;
    delete req.session.returnTo;

    // Redirect to frontend with the data
    res.redirect(`${returnUrl}?linkedinData=${encodeURIComponent(JSON.stringify(profileData))}`);
  } catch (error) {
    console.error('LinkedIn data fetch error:', error);
    res.redirect(`${FRONTEND_URL}/profile?error=linkedin_data_fetch_failed`);
  }
};
