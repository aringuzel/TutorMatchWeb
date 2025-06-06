import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, updateDoc, getDoc, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 Check if the user is logged in
onAuthStateChanged(auth, (user) => {
  const body = document.body;

  if (!user) {
    // If no user is logged in, don't display name
    document.getElementById("welcome").textContent = "Our wide range of courses";
    // If no user is logged in, don't display a message
    document.getElementById("context").textContent = "If you want to purchase a course, please sign in to do so!";
    // Hide the logout button if no user is logged in
    document.getElementById("logout-btn").style.display = 'none';
    //show login button
    document.getElementById("login-btn").style.display = 'inline-block';
    Darkmode.style.display = 'none';


  } else {
    document.getElementById("welcome").textContent = `Welcome to the Courses section!`;
    document.getElementById("context").textContent = "You want to add more courses? Great, look below";
    // Show the logout button if user is logged in
    document.getElementById("logout-btn").style.display = 'inline-block';
    // hide login button
    document.getElementById("login-btn").style.display = 'none';
    Darkmode.style.display = 'block';


  }
});


// Logout function
document.getElementById("logout-btn").addEventListener("click", async function () {
  try {
    await signOut(auth); // Sign out the user from Firebase
    location.reload()
  } catch (error) {
    console.error("Error logging out:", error);
    alert("An error occurred while logging out.");
  }
});

//Login function
document.getElementById("login-btn").addEventListener("click", async function () {
  try {
    window.location.href = "/pages/login.html";
  } catch (error) {
    console.error("Error logging out:", error);
    alert("An error occurred while logging out.");
  }
});




document.addEventListener("DOMContentLoaded", async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await updateCourseButtons(user.uid);
    }
  });
});

async function updateCourseButtons(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("User data not found.");
    return;
  }

  const userData = userSnap.data();
  const isTutor = userData.role === "tutor";

  const coursesSnapshot = await getDocs(collection(db, "users", userId, "courses"));
  const userCourses = coursesSnapshot.docs.map(doc => doc.id);

  document.querySelectorAll('.course').forEach(courseElement => {
    const courseId = courseElement.getAttribute('data-course-id');
    const button = courseElement.querySelector('.buy-btn, .remove-btn');

    if (!button) return;

    if (userCourses.includes(courseId)) {
      button.textContent = "Remove Course";
      button.classList.add("remove-btn");
      button.classList.remove("buy-btn");
      button.disabled = false;
      button.onclick = () => removeCourse(userId, courseId);
    } else {
      if (isTutor) {
        button.textContent = "Tutors can't buy";
        button.disabled = true;
        button.classList.add("disabled-btn"); // Optional styling
        button.onclick = null;
      } else {
        button.textContent = "Buy Course";
        button.disabled = false;
        button.classList.add("buy-btn");
        button.classList.remove("remove-btn");
        button.onclick = (e) => buyCourse(e, userId, courseId);
      }
    }
  });
}


async function buyCourse(event, userId, courseId) {
  const button = event.target;
  const courseElement = button.closest('.course');
  const courseName = courseElement.querySelector('h2').textContent;

  try {
    const courseRef = doc(db, "users", userId, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (courseSnap.exists()) {
      alert("You already have this course.");
      return;
    }

    await setDoc(courseRef, {
      courseName,
      purchasedAt: new Date().toISOString()
    });

    alert(`You have successfully purchased ${courseName}!`);
    updateCourseButtons(userId);
  } catch (error) {
    console.error("Error purchasing course:", error);
    alert("An error occurred while purchasing the course.");
  }
}

async function removeCourse(userId, courseId) {
  try {
    const courseRef = doc(db, "users", userId, "courses", courseId);
    await deleteDoc(courseRef);

    alert("Course removed successfully.");
    updateCourseButtons(userId);
  } catch (error) {
    console.error("Error removing course:", error);
    alert("An error occurred while removing the course.");
  }
}

let Darkmode = document.getElementById('Darkmode-HTML')

// Check if dark mode is saved in localStorage on page load
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
        }
      else{
        Darkmode.innerText="Light Mode";
        localStorage.setItem('darkMode', 'enabled');
        }
};

Darkmode.onclick = DarkmodeJS;
