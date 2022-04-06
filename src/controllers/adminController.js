
async function addCategory (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}

async function updateCategory (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function getAllCategories (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function getByIdCategories (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function getCategoryFiltered (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}
async function deleteCategory (req, res) {
  try {
    return res.status(200).send({ data: 'response', success: true })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
  }
}

module.exports = { addCategory, updateCategory, getAllCategories, getByIdCategories, getCategoryFiltered, deleteCategory }
