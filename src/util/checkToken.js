const { default: axios } = require('axios')
async function checkTokenAdmin (token) {
  const response = await axios.get('http://localhost:5001/api/tokenCheck', {
    headers: {
      'x-access-token': token,
      role: 'admin',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'x-access-token'
    }
  })
  return response.data
}

module.exports = { checkTokenAdmin }
