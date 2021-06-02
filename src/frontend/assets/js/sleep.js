function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reloadSideAsync() {
    await sleep(1000);
    location.reload();
}