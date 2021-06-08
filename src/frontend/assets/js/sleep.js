function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reloadSideAsync() {
    await sleep(1000);
    location.reload();
}

async function loadingiconAsync(){
    await sleep(1000);
    document.getElementById("loading-container").style.display = "none";
}