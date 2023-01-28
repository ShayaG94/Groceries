const tabNameIndex = window.location.href.indexOf("=") + 1;
const endTabName = window.location.href.indexOf("&");
const tabName = window.location.href.slice(tabNameIndex, endTabName > 0 ? endTabName : window.location.href.length);
const tabButton = document.querySelector(`#${tabName}`);
const tabPane = document.querySelector(`#${tabName}-tab-pane`);
tabButton.classList.add("active");
tabPane.classList.add("show");
tabPane.classList.add("active");

const tabs = document.querySelectorAll("button.nav-link");
tabs.forEach((tab) =>
    tab.addEventListener("click", (e) => {
        const tabName = e.target.id;
        const tabNameIndex = window.location.href.indexOf("=") + 1;
        if (tabNameIndex > 0) {
            const url = window.location.href.slice(0, tabNameIndex);
            window.history.replaceState("", "", url + tabName);
        }
    })
);

if (endTabName > 0) {
    const url = window.location.href.slice(0, endTabName);
    const secondQuery = window.location.href.slice(endTabName + 1);
    window.history.replaceState("", "", url);
    const idIndex = secondQuery.indexOf("=") + 1;
    const purchaseID = secondQuery.slice(idIndex);
    const purchaseDiv = document.querySelector(`#p${purchaseID} button`);
    window.addEventListener("load", () => {
        purchaseDiv.click();
    });
}
