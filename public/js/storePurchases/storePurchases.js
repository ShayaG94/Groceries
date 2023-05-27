const baseProductForm = document.querySelector("#baseProductForm");
const addProductBtn = document.querySelector("#addProduct");

const addProductForm = function () {
    const productsForm = document.querySelector("#productsForm");
    const newFormIndex = productsForm.childElementCount + 1;
    const newProductForm = baseProductForm.cloneNode(true);

    for (let formChild of newProductForm.children) {
        if (formChild.type === "button") {
            formChild.addEventListener("click", deleteParentNode);
            continue;
        }
        for (let grandChild of formChild.children) {
            if (grandChild.nodeName === "INPUT") {
                grandChild.id = grandChild.id.replace(/\d{1,2}/, newFormIndex);
                grandChild.name = grandChild.name.replace(/\d{1,2}/, newFormIndex);
            } else if (grandChild.nodeName === "LABEL") {
                grandChild.attributes.for.value = grandChild.attributes.for.value.replace(/\d{1,2}/, newFormIndex);
            }
        }
    }

    newProductForm.removeAttribute("id");
    newProductForm.classList.remove("d-none");

    productsForm.insertBefore(newProductForm, productsForm.firstChild);
};

addEventListener("DOMContentLoaded", addProductForm);

addProductBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addProductForm();
});

const deleteProductBtns = document.querySelectorAll(".deleteProduct");
deleteProductBtns.forEach((btn) => {
    btn.addEventListener("click", deleteParentNode);
});

function deleteParentNode() {
    this.parentNode.remove();
}
