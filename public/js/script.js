const productCards = document.querySelectorAll(".productIndexCard");
const categoriesLinks = document.querySelectorAll(".productIndexCard a");

productCards.forEach((card) => {
    card.addEventListener("mouseover", function (e) {
        e.target.style.cursor = "pointer";
        this.childNodes[1].childNodes[1].style.textDecoration = "underline";
    });
    card.addEventListener("mouseout", function (e) {
        this.childNodes[1].childNodes[1].style.textDecoration = "";
    });
    card.addEventListener("click", (e) => {
        const productPath = card.getAttribute("data-path");
        window.location = `products/${productPath}`;
    });
});

categoriesLinks.forEach((link) => {
    link.addEventListener("mouseover", function (e) {
        this.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].style.textDecoration = "";
        e.stopPropagation();
    });
});

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

const myModal = document.querySelector(".modal");
const modal = bootstrap.Modal.getInstance(myModal);
const modalSubmit = document.querySelector("#categoryModal > div > div > div.modal-footer.border.border-0.pt-0 > button.btn.btn-info");

function addCat() {
    const newCat = document.querySelector("#categoryNew").value;
    const newOption = document.createElement("option");
    newOption.setAttribute("selected", true);
    newOption.setAttribute("value", newCat);
    newOption.innerText = newCat;
    document.querySelector("select").appendChild(newOption);
}
