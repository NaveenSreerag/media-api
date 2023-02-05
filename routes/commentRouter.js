const express = require('express')
const { createComment, updateComment } = require('../controllers/commentControl')
const { isAuthenticatedUser } = require('../middleware/auth')

const router = express.Router()




router.route('/create/comment/:id').post(isAuthenticatedUser,createComment)
router.route('/update/comment/:id').post(isAuthenticatedUser,updateComment)





module.exports =router
