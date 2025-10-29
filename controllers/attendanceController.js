import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

const getAttendance = async (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0]

        const attendance = await Attendance.find({date}).populate({
            path: "employeeId", 
            populate: [
                "department",
                "userId"
            ] 
        })
        res.status(200).json({success: true, attendance})
    } catch(error) {
        res.status(500).json({success:false , message: error.message})
    }

}

const updateAttendance = async (req, res) => {
    try {
        const {employeeId} = req.params
        const {status} = req.body
        const date = new Date().toISOString().split('T')[0]
        const employee = await Employee.findOne({employeeId})

        const attendance = await Attendance.findOneAndUpdate({employeeId: employee._id, date}, {status}, {new: true})

        res.status(200).json({success: true, attendance})
    } catch(error) {
        res.status(500).json({success:false , message: error.message})
    }
}

const attendanceReport = async (req, res) => {
    try {
        const {date, limit = 5, skip = 0 } = req.query;
        const query = {};

        if(date) {
            query.date = date;
        }

        console.log('Fetching attendance data with query:', query);

        const attendanceData = await Attendance.find(query)
        .populate({
            path: "employeeId",
            populate: [
                "department",
                "userId"
            ]
        }).sort({date: -1}).skip(parseInt(skip)).limit(parseInt(limit))

        console.log(`Found ${attendanceData.length} attendance records`);

        const groupData = attendanceData.reduce((result, record) => {
            // Add null checks for nested properties
            if (!record || !record.employeeId) {
                console.warn('Skipping record with missing employeeId:', record);
                return result;
            }

            if(!result[record.date]) {
                result[record.date] = []
            }

            // Safe access to nested properties with fallbacks
            const employeeId = record.employeeId?.employeeId || 'N/A';
            const employeeName = record.employeeId?.userId?.name || 'Unknown Employee';
            const departmentName = record.employeeId?.department?.dep_name || 'Unknown Department';
            const status = record.status || "Not Marked";

            result[record.date].push({
                employeeId,
                employeeName,
                departmentName,
                status
            });

            return result;
        }, {})

        console.log('Grouped data keys:', Object.keys(groupData));
        return res.status(200).json({success: true, groupData})
    } catch(error) {
        console.error('Attendance report error:', error);
        res.status(500).json({success:false , message: error.message})
    }
}


export {getAttendance, updateAttendance, attendanceReport}