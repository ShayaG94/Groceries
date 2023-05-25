const baseProductForm = document.querySelector("#baseProductForm");
const addProductBtn = document.querySelector("#addProduct");

addProductBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const productsForm = document.querySelector("#productsForm");
    const newFormIndex = productsForm.childElementCount + 1;
    const newProductForm = baseProductForm.cloneNode(true);

    for (let child of newProductForm.children) {
        if (child.type === "button") {
            child.addEventListener("click", deleteParentNode);
            continue;
        }
        const updateNode = child.firstElementChild;
        updateNode.id = updateNode.id.replace(/\d{1,2}/, newFormIndex);
        updateNode.name = updateNode.name.replace(/\d{1,2}/, newFormIndex);
    }

    newProductForm.removeAttribute("id");
    newProductForm.classList.remove("d-none");

    productsForm.insertBefore(newProductForm, productsForm.firstChild);
});

const deleteProductBtns = document.querySelectorAll(".deleteProduct");
deleteProductBtns.forEach((btn) => {
    btn.addEventListener("click", deleteParentNode);
});

function deleteParentNode() {
    this.parentNode.remove();
}
