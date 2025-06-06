import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, updateDoc, getDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        const body = document.body;

        if (!user) {
            // If no user is logged in
            document.getElementById("full-name").textContent = "Please sign in to view your profile";
            document.getElementById("context").textContent = "Don't have an account? Make an account to view your profile!";
            document.getElementById("logout-btn").style.display = 'none';
            document.getElementById("login-btn").style.display = 'inline-block';
            Darkmode.style.display = 'none';
            document.getElementById("feedback-section").style.display = 'none';
            document.getElementById("course").textContent = "";
        } else {
            // Fetch the user's role and display specific content
            const username = user.displayName;
            const userRef = doc(db, "users", user.uid);
            getDoc(userRef).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const role = userData.role; // Assuming role is saved as 'student' or 'tutor'

                    console.log("User Role:", role);  // Log the role to see if it's correct

                    // Set up the display based on the user's role
                    if (role === 'tutor') {

                        // Call loadStudents function to load the students when the page loads
                        loadStudents();
                        loadStudentCourses();
                        console.log("Tutor detected, showing feedback section.");
                        document.getElementById("full-name").textContent = `Welcome, Tutor ${username}!`;
                        document.getElementById("context").textContent = "This is your Learning Hub. You can review students progress here.";
                        document.getElementById("course").textContent = "You can now provide feedback on students' courses.";
                        document.getElementById("feedback-section").style.display = 'block'; // Show feedback section
                        document.getElementById("course-list").style.display = 'none'; // Hide course list for tutors
                        
                    } else {
                        console.log("Non-tutor role detected.");
                        document.getElementById("full-name").textContent = `Welcome, ${username}!`;
                        document.getElementById("context").textContent = "This is your Learning Hub. Your courses and Tutor feedback can be viewed here.";
                        document.getElementById("course").textContent = "Courses:";
                        document.getElementById("feedback-section").style.display = 'none';
                        displayUserCourses(user);
                    }
                }
            });
            document.getElementById("logout-btn").style.display = 'inline-block';
            document.getElementById("login-btn").style.display = 'none';
            Darkmode.style.display = 'block';
        }
    });
});

// Function to fetch and display the user's courses (only for students)
async function displayUserCourses(user) {
    const courseListDiv = document.getElementById("course");

    try {
        const coursesRef = collection(db, "users", user.uid, "courses");
        const snapshot = await getDocs(coursesRef);

        if (!snapshot.empty) {
            let coursesList = "<ul><h3><strong>Courses:</strong></h3>";
            snapshot.forEach(doc => {
                const course = doc.data();
                const courseName = course.courseName;
                const feedback = course.feedback || "No feedback provided yet."; // If no feedback, show default message
                const feedbackName = course.reviewedBy || "";
                const feedbackTime = course.reviewedAt || "";

                coursesList += `
                    <li>
                        <strong>${courseName}</strong>
                    </li>
                    <li>
                        <em>Feedback:</em>
                    </li>
                    <li>
                        ${feedback}
                    </li>
                    <li>
                        <i>Time: ${feedbackTime}</i>
                    </li>
                    <li>
                        <i>By: ${feedbackName}</i>
                    </li>
                    <br>
                `;
            });
            coursesList += "</ul>";
            courseListDiv.innerHTML = coursesList;
        } else {
            courseListDiv.textContent = "You haven't purchased any courses yet.";
        }
    } catch (error) {
        console.error("Error fetching user courses:", error);
        courseListDiv.textContent = "Error loading courses.";
    }
}

// Function to load and display only students (role: 'student')
async function loadStudents() {
    const studentsSection = document.getElementById("students");
    studentsSection.innerHTML = "Loading students..."; // Loading message

    try {
        const usersRef = collection(db, "users"); // Reference to the 'users' collection
        const q = query(usersRef, where("role", "==", "student")); // Query to filter by role "student"
        const snapshot = await getDocs(q); // Execute query

        if (snapshot.empty) {
            studentsSection.innerHTML = "No students found."; // If no students found
            return;
        }

        let html = "<ul>"; // Prepare to display a list of students
        snapshot.forEach(doc => {
            const userData = doc.data();
            const userId = doc.id;
            const userName = userData.username || "Anonymous"; // Default to "Anonymous" if no name is provided

            html += `
                <li>
                    <strong>Students:</strong>
                </li>
                <li>
                    <strong>${userName}</strong>
                </li>
                <li>
                    UID: ${userId}
                </li>
                <br>
            `;
        });
        html += "</ul>";
        studentsSection.innerHTML = html; // Display the list of students and UIDs
    } catch (error) {
        console.error("Error loading students:", error);
        studentsSection.innerHTML = `Error loading students: ${error.message}`; // Display error if there is a problem
    }
}

// Load courses when tutor clicks the button
document.getElementById("load-courses-btn").addEventListener("click", loadStudentCourses);

// Load a student's courses (for tutors)
async function loadStudentCourses() {
    const studentId = document.getElementById("student-id").value.trim();
    const courseListDiv = document.getElementById("student-courses");

    if (!studentId) {
        courseListDiv.innerHTML = "Please provide a valid student ID.";
        return;
    }

    courseListDiv.innerHTML = "Loading...";

    const coursesRef = collection(db, "users", studentId, "courses");

    try {
        const snapshot = await getDocs(coursesRef);

        if (snapshot.empty) {
            courseListDiv.innerHTML = "No courses found for this student.";
            return;
        }

        let html = "<ul>";
        snapshot.forEach(doc => {
            const course = doc.data();
            const courseId = doc.id;
            html += `
                <li>
                    <strong>${course.courseName}</strong>
                </li>
                <li>
                    <textarea id="feedback-${courseId}" placeholder="Write feedback...">${course.feedback || ''}</textarea>
                </li>
                <li>
                    <button id="submit-${courseId}" onclick="submitFeedback('${studentId}', '${courseId}')">Submit Feedback</button>
                </li>
            `;
        });
        html += "</ul>";
        courseListDiv.innerHTML = html;
    } catch (error) {
        console.error("Error loading courses:", error);
        courseListDiv.innerHTML = "Error loading courses.";
    }
}

// Submit feedback
window.submitFeedback = async function (studentId, courseId) {
    const feedbackText = document.getElementById(`feedback-${courseId}`).value.trim();
    const button = document.getElementById(`submit-${courseId}`);

    if (!feedbackText) {
        alert("Please enter feedback before submitting.");
        return;
    }

    const courseRef = doc(db, "users", studentId, "courses", courseId);

    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        const user = auth.currentUser;
        const displayName = user?.displayName || "Anonymous";

        await updateDoc(courseRef, {
            feedback: feedbackText,
            reviewedBy: displayName,
            reviewedAt: new Date().toISOString()
        });

        button.textContent = "Submitted!";
        document.getElementById(`feedback-${courseId}`).value = ""; // Clear feedback textarea

        // Optionally, reset the textarea with a placeholder or message
        setTimeout(() => {
            button.textContent = "Submit Feedback";  // Reset button text after 2 seconds
        }, 2000);

        alert("Feedback submitted successfully!");
    } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("Failed to submit feedback.");
        button.textContent = "Submit Feedback";
    } finally {
        button.disabled = false;
    }
};

// Logout function
document.getElementById("logout-btn").addEventListener("click", async function () {
    try {
        await signOut(auth); // Sign out the user from Firebase
        location.reload();
    } catch (error) {
        console.error("Error logging out:", error);
        alert("An error occurred while logging out.");
    }
});

// Login function
document.getElementById("login-btn").addEventListener("click", async function () {
    try {
        window.location.href = "/pages/login.html";
    } catch (error) {
        console.error("Error logging out:", error);
        alert("An error occurred while logging out.");
    }
});

// Dark Mode Logic
let Darkmode = document.getElementById('Darkmode-HTML');

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add("dark-mode");
    Darkmode.innerText = "Light Mode";
} else {
    document.body.classList.remove("dark-mode");
    Darkmode.innerText = "Dark Mode";
}

function DarkmodeJS() {
    var element = document.body;
    element.classList.toggle("dark-mode");
    element.classList.toggle("Darkmode-HTML");
    if(Darkmode.innerText=="Light Mode"){
        Darkmode.innerText="Dark Mode";
        localStorage.setItem('darkMode', 'disabled');
    } else {
        Darkmode.innerText="Light Mode";
        localStorage.setItem('darkMode', 'enabled');
    }
};

Darkmode.onclick = DarkmodeJS;
