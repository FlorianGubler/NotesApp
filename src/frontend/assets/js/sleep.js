function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reloadSideAsync() {
    await sleep(750);
    location.reload();
}