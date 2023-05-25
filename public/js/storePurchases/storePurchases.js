const baseProductForm = document.querySelector("#baseProductForm");
const addProductBtn = document.querySelector("#addProduct");

addProductBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const productsForm = document.querySelector("#productsForm");
    const newFormIndex = productsForm.childElementCount + 1;
    const newProductForm = baseProductForm.cloneNode(true);

    for (let child of newProductForm.children) {
        const updateNode = child.firstElementChild;
        updateNode.id = updateNode.id.replace(/\d{1,2}/, newFormIndex);
        updateNode.name = updateNode.name.replace(/\d{1,2}/, newFormIndex);
    }

    newProductForm.removeAttribute("id");
    newProductForm.classList.remove("d-none");

    productsForm.insertBefore(newProductForm, productsForm.firstChild);
});
