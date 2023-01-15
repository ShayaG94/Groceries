const queriesIndex = window.location.href.indexOf("?");
const url = window.location.href.slice(0, queriesIndex);

const tabNameIndex = window.location.href.indexOf("=") + 1;
const tabName = window.location.href.slice(tabNameIndex);

if (queriesIndex > 0) {
    window.addEventListener("load", () => {
        window.history.replaceState("", "", url);
    });
    const tabButton = document.querySelector(`#${tabName}-tab`);
    const tabPane = document.querySelector(`#${tabName}-tab-pane`);
    tabButton.classList.add("active");
    tabPane.classList.add("show");
    tabPane.classList.add("active");
} else {
    document.querySelector("#stats-tab").classList.add("active");
    document.querySelector("#stats-tab-pane").classList.add("active");
    document.querySelector("#stats-tab-pane").classList.add("show");
}
