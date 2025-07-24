const express = require("express");
const router = express.Router();
const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const groupController = require('../controllers/groupController');


router.use(auth);

router
  .route('/')
  .get(groupController.getGroups)
  .post(checkRole('instructor','manager', 'admin'), groupController.createGroup);

router
  .route('/:id')
  // .get(groupController.getGroup)
  .put(checkRole('instructor','manager', 'admin'), groupController.updateGroup)
  .delete(checkRole('instructor','manager', 'admin'), groupController.deleteGroup);

router.post('/addStudent', groupController.addStudentToGroup);
router.get('/instructorGroups/:id', groupController.getGroupsOfInstructor);

router.post('/addLecToGroup', groupController.addLectureToGroup);
router.put('/editLecToGroup/:id', groupController.editLectureToGroup);
module.exports = router;
