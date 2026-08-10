import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");
const ratingInputs = document.querySelectorAll('input[name="rating"]');

const updateRatingDisplay = () => {
    const selectedValue = document.querySelector('input[name="rating"]:checked')?.value;
    ratingInputs.forEach((input) => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            label.classList.toggle("active", selectedValue && Number(input.value) <= Number(selectedValue));
        }
    });
};

ratingInputs.forEach((input) => {
    input.addEventListener("change", updateRatingDisplay);
});

if (noteForm) {
    noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const course = document.getElementById("course").value.trim();
    const student = document.getElementById("student").value.trim();
    const note = document.getElementById("note").value.trim();
    const rating = Number(document.querySelector('input[name="rating"]:checked')?.value || 0);

    if (!course || !student || !note || !rating) return;
    await addDoc(collection(db, "lecturerNotes"), {
        course,
        student,
        note,
        rating,
        createdAt: new Date(),
    });

    noteForm.reset();
    updateRatingDisplay();
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