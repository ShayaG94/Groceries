const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

function addCat() {
    const newCat = document.querySelector("#categoryNew").value;
    const newOption = document.createElement("option");
    newOption.setAttribute("selected", true);
    newOption.setAttribute("value", newCat);
    newOption.innerText = newCat;
    document.querySelector("select").appendChild(newOption);
}
