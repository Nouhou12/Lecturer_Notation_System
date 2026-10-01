import { collection, addDoc, getDoc, getDocs, doc, onSnapshot, query, orderBy, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { auth, db } from "./firebase-config.js";
import { getClassCourses } from "./class-courses.js";

const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");
const courseSelect = document.getElementById("course");
const submissionState = { editingId: null };

function populateCourses(courses, emptyMessage) {
    if (!courseSelect) return;

    courseSelect.replaceChildren(new Option(emptyMessage, "", true, true));
    courseSelect.options[0].disabled = true;
    courses.forEach((course) => courseSelect.add(new Option(course, course)));
}

if (courseSelect) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            populateCourses([], "Sign in to load your subjects");
            submissionState.editingId = null;
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const studentClass = userDoc.exists() ? userDoc.data().class || "" : "";
            const courses = getClassCourses(studentClass);
            populateCourses(courses, courses.length ? "Select a subject" : "No subjects found for your class");

            const submittedNoteSnapshot = await getDocs(query(collection(db, "lecturerNotes"), where("uid", "==", user.uid)));
            if (!submittedNoteSnapshot.empty) {
                const existingNote = submittedNoteSnapshot.docs[0];
                const data = existingNote.data();
                submissionState.editingId = existingNote.id;
                const noteField = document.getElementById("note");
                const submitButton = noteForm?.querySelector('button[type="submit"]');

                if (courseSelect) courseSelect.value = data.course || "";
                if (noteField) noteField.value = data.note || "";

                Object.entries(data.ratings || {}).forEach(([key, value]) => {
                    const radio = document.querySelector(`input[name="rating_${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                });

                if (submitButton) submitButton.textContent = "Update Evaluation";
            } else {
                submissionState.editingId = null;
                if (noteForm) {
                    const submitButton = noteForm.querySelector('button[type="submit"]');
                    if (submitButton) submitButton.textContent = "Submit Evaluation";
                }
            }
        } catch (error) {
            console.error("Error loading class subjects:", error);
            populateCourses([], "Unable to load your subjects");
        }
    });
}

const getSelectedRating = (groupName) => Number(document.querySelector(`input[name="${groupName}"]:checked`)?.value || 0);

if (noteForm) {
    noteForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const course = document.getElementById("course")?.value.trim();
        const note = document.getElementById("note")?.value.trim();

        const ratings = {
            clarity: getSelectedRating("rating_clarity"),
            behavior: getSelectedRating("rating_behavior"),
            punctuality: getSelectedRating("rating_punctuality"),
            material: getSelectedRating("rating_materials"),
        };

        const values = Object.values(ratings).filter((value) => value > 0);
        const rating = values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0;

        if (!course || !note || values.length < 4) return;

        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Error: You must be logged in to submit an evaluation.');
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            const role = userDoc.exists() ? userDoc.data().role : "";
            const studentClass = userDoc.exists() ? userDoc.data().class?.trim() : "";

            if (role === "admin") {
                alert('Admin accounts cannot submit student evaluations.');
                return;
            }

            if (!studentClass) {
                alert('Error: Your class information is not available in your user profile.');
                return;
            }

            const existingNoteQuery = query(collection(db, "lecturerNotes"), where("uid", "==", currentUser.uid));
            const existingNoteSnapshot = await getDocs(existingNoteQuery);

            if (submissionState.editingId || !existingNoteSnapshot.empty) {
                const noteId = submissionState.editingId || existingNoteSnapshot.docs[0].id;
                await updateDoc(doc(db, "lecturerNotes", noteId), {
                    uid: currentUser.uid,
                    course,
                    note,
                    rating,
                    overallRating: rating,
                    ratings,
                    class: studentClass,
                    updatedAt: new Date(),
                });
                alert('Evaluation updated successfully!');
                return;
            }

            await addDoc(collection(db, "lecturerNotes"), {
                uid: currentUser.uid,
                course,
                note,
                rating,
                overallRating: rating,
                ratings,
                class: studentClass,
                createdAt: new Date(),
            });
            alert('Evaluation submitted successfully!');
            noteForm.reset();
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Error submitting evaluation. Please try again.');
        }
    });
}

const renderStars = (count) => {
    let stars = "";
    for (let i = 1; i <= 5; i += 1) {
        stars += i <= count ? "★" : "☆";
    }
    return stars;
};

const renderNotes = (items) => {
    if (!notesList) return;
    notesList.innerHTML = "";

    if (items.length === 0) {
        notesList.innerHTML = "<p class='empty-state'>No notes yet.</p>";
        return;
    }

    items.forEach((doc) => {
        const data = doc.data();
        const item = document.createElement("article");
        item.className = "note-item";
        item.innerHTML = `
            <strong>${data.course}</strong>
            <div class="note-rating">${renderStars(data.rating || 0)}</div>
            <p>${data.note}</p>
        `;
        notesList.appendChild(item);
    });
};

const notesQuery = query(collection(db, "lecturerNotes"), orderBy("createdAt", "desc"));
onSnapshot(notesQuery, (snapshot) => {
    renderNotes(snapshot.docs);
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(console.error);
}