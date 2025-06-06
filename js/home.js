import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAYECrfhI2bm0esgSGAJkUlvhCHBZmYEXo",
    authDomain: "tutormatch-7e043.firebaseapp.com",
    projectId: "tutormatch-7e043",
    storageBucket: "tutormatch-7e043.firebasestorage.app",
    messagingSenderId: "694680606532",
    appId: "1:694680606532:web:1a1e782be899c55da76911"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Check if the user is logged in
onAuthStateChanged(auth, (user) => {
  const body = document.body;

  if (!user) {
    // Hide the logout button if no user is logged in
    document.getElementById("logout-btn").style.display = 'none';
    //show login button
    document.getElementById("login-btn").style.display = 'inline-block';
    Darkmode.style.display = 'none';


  } else {
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

let Darkmode = document.getElementById('Darkmode-HTML');

// Check if dark mode is saved in localStorage on page load
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add("dark-mode");
    if (Darkmode) Darkmode.innerText = "Light Mode";
} else {
    document.body.classList.remove("dark-mode");
    if (Darkmode) Darkmode.innerText = "Dark Mode";
}

// Darkmode toggle function
function DarkmodeJS() {
    const element = document.body;
    element.classList.toggle("dark-mode");
    
    if (Darkmode) {
        if (element.classList.contains("dark-mode")) {
            Darkmode.innerText = "Light Mode";
            localStorage.setItem('darkMode', 'enabled');
        } else {
            Darkmode.innerText = "Dark Mode";
            localStorage.setItem('darkMode', 'disabled');
        }
    }
}

// Assign Darkmode toggle function to the button
if (Darkmode) {
    Darkmode.onclick = DarkmodeJS;
}

let slideIndex = 0;

function showSlides() {
    const slides = document.querySelectorAll("#reviews .slides p");

    // Log the slides to check if they're selected properly
    console.log("Slides:", slides);

    if (slides.length === 0) return;

    slides.forEach(slide => slide.style.display = "none"); // Hide all slides

    // Log the current slide index
    console.log("Current Slide Index:", slideIndex);

    slides[slideIndex].style.display = "block"; // Show the current slide
    
    slideIndex = (slideIndex + 1) % slides.length; // Cycle through slides
    setTimeout(showSlides, 3000); // Change slide every 3 seconds
}

// Ensure the slideshow starts after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired");  // Log to check when page is ready
    showSlides();  // Start the slideshow when the page is loaded
});