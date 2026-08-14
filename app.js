import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");

const getSelectedRating = (groupName) => Number(document.querySelector(`input[name="${groupName}"]:checked`)?.value || 0);

if (noteForm) {
    noteForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const course = document.getElementById("course")?.value.trim();
        const lecturer = document.getElementById("lecturer")?.value.trim();
        const student = document.getElementById("student")?.value.trim();
        const note = document.getElementById("note")?.value.trim();

        const ratings = {
            clarity: getSelectedRating("rating_clarity"),
            behavior: getSelectedRating("rating_behavior"),
            punctuality: getSelectedRating("rating_punctuality"),
            material: getSelectedRating("rating_materials"),
        };

        const values = Object.values(ratings).filter((value) => value > 0);
        const rating = values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0;

        if (!course || !lecturer || !student || !note || values.length < 4) return;

        await addDoc(collection(db, "lecturerNotes"), {
            course,
            lecturer,
            student,
            note,
            rating,
            overallRating: rating,
            ratings,
            createdAt: new Date(),
        });

        noteForm.reset();
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
            <div><em>Student:</em> ${data.student}</div>
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