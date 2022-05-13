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

async function checkTokenClient (token) {
  const response = await axios.get('http://localhost:5001/api/tokenCheck', {
    headers: {
      'x-access-token': token,
      role: 'client',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'x-access-token'
    }
  })
  return response.data
}

async function checkTokenPartner (token) {
  const response = await axios.get('http://localhost:5001/api/tokenCheck', {
    headers: {
      'x-access-token': token,
      role: 'partner',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'x-access-token'
    }
  })
  return response.data
}

module.exports = { checkTokenAdmin, checkTokenPartner, checkTokenClient }
