import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Combination from '../models/Combination.js';
import Result from '../models/Result.js';
import Notice from '../models/Notice.js';

dotenv.config();

const setupLocalDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Student.deleteMany({});
    await Combination.deleteMany({});
    await Result.deleteMany({});
    await Notice.deleteMany({});

    // Create Classes
    console.log('Creating classes...');
    const classes = await Class.insertMany([
      { name: 'Class 1', section: 'A' },
      { name: 'Class 1', section: 'B' },
      { name: 'Class 2', section: 'A' },
      { name: 'Class 2', section: 'B' },
      { name: 'Class 3', section: 'A' },
      { name: 'Class 3', section: 'B' },
      { name: 'Class 4', section: 'A' },
      { name: 'Class 4', section: 'B' },
      { name: 'Class 5', section: 'A' },
      { name: 'Class 5', section: 'B' },
      { name: 'Class 6', section: 'A' },
      { name: 'Class 6', section: 'B' },
      { name: 'Class 7', section: 'A' },
      { name: 'Class 7', section: 'B' },
      { name: 'Class 8', section: 'A' },
      { name: 'Class 8', section: 'B' },
      { name: 'Class 9', section: 'A' },
      { name: 'Class 9', section: 'B' },
      { name: 'Class 10', section: 'A' },
      { name: 'Class 10', section: 'B' }
    ]);

    // Create Subjects
    console.log('Creating subjects...');
    const subjects = await Subject.insertMany([
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English', code: 'ENG' },
      { name: 'Urdu', code: 'URD' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Studies', code: 'SS' },
      { name: 'Islamic Studies', code: 'ISL' },
      { name: 'Computer Science', code: 'CS' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHEM' },
      { name: 'Biology', code: 'BIO' },
      { name: 'Pakistan Studies', code: 'PS' },
      { name: 'Geography', code: 'GEO' },
      { name: 'History', code: 'HIST' }
    ]);

    // Create Combinations (Subject-Class mappings)
    console.log('Creating combinations...');
    const combinations = [];
    
    // Basic subjects for all classes
    const basicSubjects = subjects.filter(s => 
      ['MATH', 'ENG', 'URD', 'ISL'].includes(s.code)
    );
    
    // Science subjects for higher classes
    const scienceSubjects = subjects.filter(s => 
      ['SCI', 'PHY', 'CHEM', 'BIO'].includes(s.code)
    );
    
    // Social subjects
    const socialSubjects = subjects.filter(s => 
      ['SS', 'PS', 'GEO', 'HIST'].includes(s.code)
    );

    // Add basic subjects to all classes
    for (const cls of classes) {
      for (const subject of basicSubjects) {
        combinations.push({
          classId: cls._id,
          subjectId: subject._id,
          isActive: true
        });
      }
    }

    // Add science and social subjects to appropriate classes
    const higherClasses = classes.filter(c => 
      parseInt(c.name.split(' ')[1]) >= 6
    );

    for (const cls of higherClasses) {
      // Add science subjects
      for (const subject of scienceSubjects.slice(0, 1)) { // General Science
        combinations.push({
          classId: cls._id,
          subjectId: subject._id,
          isActive: true
        });
      }
      
      // Add social studies
      for (const subject of socialSubjects.slice(0, 1)) { // Social Studies
        combinations.push({
          classId: cls._id,
          subjectId: subject._id,
          isActive: true
        });
      }
    }

    // Add advanced subjects for classes 9-10
    const seniorClasses = classes.filter(c => 
      parseInt(c.name.split(' ')[1]) >= 9
    );

    for (const cls of seniorClasses) {
      // Add Physics, Chemistry, Biology
      for (const subject of scienceSubjects.slice(1)) {
        combinations.push({
          classId: cls._id,
          subjectId: subject._id,
          isActive: true
        });
      }
      
      // Add Pakistan Studies
      const pakStudies = subjects.find(s => s.code === 'PS');
      if (pakStudies) {
        combinations.push({
          classId: cls._id,
          subjectId: pakStudies._id,
          isActive: true
        });
      }
    }

    await Combination.insertMany(combinations);

    // Create Sample Students
    console.log('Creating students...');
    const students = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const studentsPerClass = 25; // 25 students per class
      
      for (let j = 1; j <= studentsPerClass; j++) {
        const rollNumber = `${cls.name.replace('Class ', '').replace(' ', '')}${cls.section}${j.toString().padStart(3, '0')}`;
        
        students.push({
          rollId: rollNumber,
          name: `Student ${rollNumber}`,
          fatherName: `Father of Student ${rollNumber}`,
          classId: cls._id,
          phone: `0300${Math.floor(Math.random() * 9000000) + 1000000}`,
          address: `House ${j}, Street ${Math.floor(j/5) + 1}, Chakwal`,
          academicYear: currentYear.toString(),
          isActive: true
        });
      }
    }

    await Student.insertMany(students);

    // Create Sample Results
    console.log('Creating sample results...');
    const allStudents = await Student.find().populate('classId');
    const allCombinations = await Combination.find().populate(['classId', 'subjectId']);
    
    const results = [];
    const examTypes = ['Mid Term', 'Final Term', 'Monthly Test'];
    
    for (const student of allStudents.slice(0, 50)) { // Sample results for first 50 students
      const studentCombinations = allCombinations.filter(c => 
        c.classId._id.toString() === student.classId._id.toString()
      );
      
      for (const combination of studentCombinations) {
        for (const examType of examTypes) {
          const maxMarks = examType === 'Monthly Test' ? 50 : 100;
          const marks = Math.floor(Math.random() * (maxMarks - 20)) + 20; // Random marks between 20 and maxMarks
          const percentage = (marks / maxMarks) * 100;
          
          let grade = 'F';
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 80) grade = 'A';
          else if (percentage >= 70) grade = 'B+';
          else if (percentage >= 60) grade = 'B';
          else if (percentage >= 50) grade = 'C';
          else if (percentage >= 40) grade = 'D';
          
          results.push({
            studentId: student._id,
            rollId: student.rollId,
            classId: student.classId._id,
            subjectId: combination.subjectId._id,
            marks: marks,
            maxMarks: maxMarks,
            examType: examType,
            percentage: Math.round(percentage * 100) / 100,
            grade: grade,
            academicYear: currentYear.toString()
          });
        }
      }
    }

    await Result.insertMany(results);

    // Create Sample Notices
    console.log('Creating notices...');
    const notices = [
      {
        title: 'Welcome to New Academic Year 2024',
        content: 'We welcome all students and parents to the new academic year. Classes will commence from Monday, March 4th, 2024.',
        isActive: true,
        priority: 'high',
        targetAudience: 'all',
        createdBy: 'Admin',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Mid Term Examinations Schedule',
        content: 'Mid term examinations will be conducted from April 15th to April 25th, 2024. Students are advised to prepare accordingly.',
        isActive: true,
        priority: 'high',
        targetAudience: 'students',
        createdBy: 'Academic Office',
        expiryDate: new Date('2024-04-25')
      },
      {
        title: 'Parent Teacher Meeting',
        content: 'Parent teacher meeting is scheduled for Saturday, March 30th, 2024 from 9:00 AM to 1:00 PM.',
        isActive: true,
        priority: 'medium',
        targetAudience: 'parents',
        createdBy: 'Admin',
        expiryDate: new Date('2024-03-30')
      },
      {
        title: 'Sports Day Event',
        content: 'Annual sports day will be held on Friday, May 10th, 2024. All students are encouraged to participate.',
        isActive: true,
        priority: 'medium',
        targetAudience: 'all',
        createdBy: 'Sports Department',
        expiryDate: new Date('2024-05-10')
      },
      {
        title: 'Library Hours Extended',
        content: 'Library hours have been extended. New timings: Monday to Friday 8:00 AM to 6:00 PM, Saturday 9:00 AM to 2:00 PM.',
        isActive: true,
        priority: 'low',
        targetAudience: 'students',
        createdBy: 'Library',
        expiryDate: null
      }
    ];

    await Notice.insertMany(notices);

    console.log('\n✅ Local database setup completed successfully!');
    console.log('\n📊 Database Statistics:');
    console.log(`📚 Classes: ${classes.length}`);
    console.log(`📖 Subjects: ${subjects.length}`);
    console.log(`🔗 Combinations: ${combinations.length}`);
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`📝 Results: ${results.length}`);
    console.log(`📢 Notices: ${notices.length}`);
    
    console.log('\n🎯 Sample Data Created:');
    console.log('• Classes 1-10 with sections A & B');
    console.log('• Core subjects (Math, English, Urdu, Islamic Studies)');
    console.log('• Science subjects for higher classes');
    console.log('• 25 students per class');
    console.log('• Sample results for first 50 students');
    console.log('• 5 sample notices');
    
    console.log('\n🚀 You can now start the backend server with: npm run dev');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
};

setupLocalDatabase();