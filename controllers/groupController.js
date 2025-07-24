const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Group = require('../models/group');
const User = require('../models/user');
const Instructor = require('../models/instructor');
const Student = require('../models/student');
const Course = require('../models/course');
const Lecture = require('../models/lecture');
const ReqToEnroll = require('../models/reqToEnroll');
// Import Redis cache functions from the redisClient utility
const { setCache, getCache } = require('../utils/redisClient');

// Helper function to fetch all groups and cache them in Redis
const setGroupsCache = async () => {
    const Groups = await Group.find({})
    .populate({
        path: 'instructor',
        select: 'name email phone profileRef profileModel'
    })
    .populate({
        path: 'course',
        select: 'title'
    })
    .populate({
        path: 'students',
        select: 'name email phone profileRef profileModel'
    });;
    const cacheKey = `groups`; // Define the cache key for storing all groups
    await setCache(cacheKey, JSON.stringify(Groups)); // Store groups data in Redis cache
}
exports.createGroup = asyncHandler(async (req, res) => {
    console.log(req.user);
    const { title, startDate, endDate, totalSeats, instructorId, courseId, } = req.body;
    const group = await new Group({
        title,
        startDate,
        endDate,
        totalSeats,
        instructor:instructorId,
        course:courseId,
    });
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    course.availableGroups.push(group._id);
    await course.save();
    
    await group.save();
    await setGroupsCache(); // Update Redis cache after updating a group
    res.status(201).json({
        success: true,
        data: group,
        message: 'group created successfully'
    });
});


exports.getGroups = asyncHandler(async (req, res) => {
    const cacheKey = `groups`; // Cache key for all groups
    const cachedGroups = await getCache(cacheKey); // Try to get groups from Redis cache
    if (cachedGroups) {
        // If groups are found in cache, return them
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedGroups),
            message: 'groups fetched successfully from cache'
        });
    }else{
        // If not in cache, update cache and then get from cache
        await setGroupsCache();
        const groups = await getCache(cacheKey);
        return res.status(200).json({
            success: true,
            data: JSON.parse(groups),
            message: 'groups fetched successfully from cache'
        });
    }



});


// update Group info
exports.updateGroup= asyncHandler( async(req,res)=>{
    const {title,startDate,endDate,totalSeats,instructorId,courseId} = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    const group = await Group.findByIdAndUpdate(
        req.params.id,
        {title,startDate,endDate,totalSeats,
            instructor:instructorId,
            course:courseId}
        ,{new:true,runValidators:true});
    if (!group) {
        throw new AppError('Group not found', 404);
    }
    await group.save();
    await setGroupsCache(); // Update Redis cache after updating a group
    res.status(200).json({
        success: true,
        data: group
    });
})



exports.deleteGroup = asyncHandler(async (req, res) => {
    const group=await Group.findById(req.params.id);
    const courseId=group.course;
    const course=await Course.findById(courseId);
    course.availableGroups.pull(group._id);
    await course.save();
    const students=group.students;
    for (const student of students) {
        const user=await User.findById(student).populate('profileRef');
        user.profileRef.groups.pull(group._id);
        await user.save();
    }
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
        throw new AppError('Group not found', 404);
    }
    await setGroupsCache(); // Update Redis cache after deleting a group
    res.status(200).json({
        success: true,
        data: group
    });
})







exports.addStudentToGroup = asyncHandler(async (req, res) => {
    const { groupId, studentId,reqToEnrollId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    const reqToEnroll = await ReqToEnroll.findById(reqToEnrollId);
    if (!reqToEnroll) {
        throw new AppError('request to enroll not found', 404);
    }
    const student = await User.findById(studentId).populate('profileRef');
    if (!student) {
        throw new AppError('student not found', 404);
    } 
    
    // check if student already in group
    if (group.students.includes(studentId)) {
        throw new AppError('student already in this group', 400);
    }
    
    // check if group already in student's groups
    if (student.profileRef.groups.includes(groupId)) {
        throw new AppError('group already assigned to student', 400);
    }
    
    // push student to group
    group.students.push(studentId);
    await group.save();
    
    // push group to student
    student.profileRef.groups.push(groupId);
    await student.profileRef.save();
    
    reqToEnroll.group=groupId;  
    reqToEnroll.joined=true;
    await reqToEnroll.save();
    await setGroupsCache(); // Update Redis cache after adding a student to a group
    res.status(200).json({
        success: true,
        message: 'student added to group successfully', 
        data: group
    });
     
});

 
exports.getGroupsOfInstructor = asyncHandler(async (req, res) => {
    const instructorId = req.params.id;
    const cacheKey = `groupsOfInstructor-${instructorId}`; // Cache key for instructor's groups
    const cachedGroups = await getCache(cacheKey); // Try to get instructor's groups from Redis cache
    if (cachedGroups) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedGroups),
            message: 'groups fetched successfully from cache'
        });
    }else{
        const groups = await Group.find({ instructor: instructorId })
        .populate({
            path: 'course',
            select: 'title'
        })
        .populate({
            path: 'students',
            select: 'name'
        })
        .populate({
            path: 'lectures',
            // select: 'title date description' // هات أي بيانات محتاجها من المحاضرة
        }).lean();
        // Cache the instructor's groups data in Redis
        await setCache(cacheKey, JSON.stringify(groups));
        res.status(200).json({
            success: true,
            data: groups
        });
    }

});



exports.addLectureToGroup = asyncHandler(async (req, res) => {
    const { groupId, title,description,date,objectives,videos} = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    if(group.instructor.toString() !== req.user._id.toString()){
        throw new AppError('you are not authorized to add lecture to this group', 401);
    }
    const lecture = await new Lecture({
        title,
        description,
        objectives,
        date,
        videos,
        group:groupId,
        course:group.course
    });
    await lecture.save();
    group.lectures.push(lecture._id);
    await group.save();

    await setGroupsCache(); // Update Redis cache after adding a lecture to a group

    res.status(200).json({
        success: true,
        message: 'lecture added to group successfully', 
        data: group
    });
});



exports.editLectureToGroup = asyncHandler(async (req, res) => {
    const { lectureId, title, description, objectives, date, videos } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        throw new AppError('lecture not found', 404);
    }
    lecture.title = title;
    lecture.description = description;
    lecture.objectives = objectives;
    lecture.date = date;
    lecture.videos = videos;
    await lecture.save();

    await setGroupsCache();

    res.status(200).json({
        success: true,
        message: 'lecture updated successfully', 
        data: lecture
    });
});







