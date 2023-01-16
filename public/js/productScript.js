const tabNameIndex = window.location.href.indexOf("=") + 1;
const tabName = window.location.href.slice(tabNameIndex);
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
