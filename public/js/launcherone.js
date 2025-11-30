/* Comp 3450 Authors: Oleanna San Antonio, Nilam Rai, Adebayo Jesutofunmi Juliet*/

/* Profile JS */
function editProfile() {
    var profileInputs = document.querySelectorAll('.profile-input');
    var profileValues = document.querySelectorAll('.profile-info-value');
    var saveButton = document.querySelector('.saveButton');
    var editProfileButton = document.querySelector('.edit-profile-btn');

    if (profileInputs[0].style.display === "none") {
        // Switch to edit mode
        profileInputs.forEach(input => input.style.display = "inline");
        profileValues.forEach(value => value.style.display = "none");
        saveButton.style.display = "block";
        editProfileButton.style.display = "none";
    } else {
        // Switch back to display mode
        profileInputs.forEach(input => input.style.display = "none");
        profileValues.forEach(value => value.style.display = "inline");
        saveButton.style.display = "none";
        editProfileButton.style.display = "block";
    }
}

function previewProfilePicture(event) {
    var reader = new FileReader();
    reader.onload = function () {
        var output = document.getElementById('profile-image-preview');
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}

/* Create and View Listing JS -- will not be used in alpha prototype */

// document.addEventListener("DOMContentLoaded", function () {
//     const listingsSection = document.querySelector(".view-listings");
//     const createListingSection = document.querySelector(".create-listing");

//     // Check if there are any listings available
//     const listings = listingsSection.querySelector(".listing");
//     if (listings.length === 0) {
//         // Hide the view listings section
//         listingsSection.style.display = "none";
//         // Display the create listing section
//         createListingSection.style.display = "block";
//     } else {
//         // Hide the create listing section
//         createListingSection.style.display = "none";
//         // Show the view listings section
//         listingsSection.style.display = "block";
//     }

//     const deleteListingBtns = document.querySelector(".delete-listing-btn");
//     deleteListingBtns.forEach(btn => {
//         btn.addEventListener("click", function () {
//             // Remove the listing from the UI
//             btn.parentNode.remove();

//             // Check if there are any listings left
//             const remainingListings = listingsSection.querySelector(".listing");
//             if (remainingListings.length === 0) {
//                 // Hide the view listings section
//                 listingsSection.style.display = "none";
//                 // Display the create listing section
//                 createListingSection.style.display = "block";
//             }
//         });
//     });

//     const createListingForm = document.getElementById("listing-form");
//     createListingForm.addEventListener("submit", function (event) {
//         event.preventDefault(); // Prevent form submission

//         // Extract image and description inputs
//         const imageInput = document.getElementById("listing-image");
//         const descriptionInput = document.getElementById("listing-description");

//         // Get the image source and description
//         const imageSrc = imageInput.value; // Assuming imageInput.value contains the image URL
//         const descriptionText = descriptionInput.value;

//         // Create a new listing element
//         const newListing = document.createElement("div");
//         newListing.classList.add("listing");

//         // Set the image and description
//         newListing.innerHTML = `
//             <img src="${imageSrc}" alt="Listing Image">
//             <p>${descriptionText}</p>
//             <button class="edit-listing-btn">Edit</button>
//             <button class="delete-listing-btn">Delete</button>
//         `;

//         // Append the new listing to the view listings section
//         listingsSection.appendChild(newListing);

//         // Hide the create listing section
//         createListingSection.style.display = "none";
//         // Show the view listings section
//         listingsSection.style.display = "block";

//         // Reset form inputs
//         createListingForm.reset();
//     });

//     // Handle click on "Edit" button
//     listingsSection.addEventListener("click", function (event) {
//         if (event.target.classList.contains("edit-listing-btn")) {
//             // Find the listing container
//             const listingContainer = event.target.closest(".listing");

//             // Extract the image source and description
//             const imageSrc = listingContainer.querySelector("img").getAttribute("src");
//             const descriptionText = listingContainer.querySelector("p").textContent;

//             // Populate the create listing form with the current listing details
//             document.getElementById("listing-image").value = imageSrc;
//             document.getElementById("listing-description").value = descriptionText;

//             // Show the create listing section
//             createListingSection.style.display = "block";
//             // Hide the view listings section
//             listingsSection.style.display = "none";
//         }
//     });
// });

/* CHAT JS */

document.addEventListener("DOMContentLoaded", function () {
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");
    const messages = document.getElementById("messages");

    // Function to handle message submission
    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const message = messageInput.value.trim();
        if (message !== "") {
            const div = document.createElement("div");
            div.textContent = message;
            messages.appendChild(div);
            // Scroll to the bottom of the messages div to show the latest message
            messages.scrollTop = messages.scrollHeight;
            messageInput.value = "";
        }
    });
});

/* SETTINGS JS */

function toggleFAQ() {
    var faqSection = document.getElementById("faq-section");
    var faqLink = document.getElementById("faq-link");
    var section1 = document.getElementById("section1");

    if (faqSection.style.display === "none") {
        faqSection.style.display = "block";
        section1.classList.add("expanded");
        faqLink.classList.add("expanded");
    } else {
        faqSection.style.display = "none";
        section1.classList.remove("expanded");
        faqLink.classList.remove("expanded");
    }
}

//js code for chat functionality


