// Global Variables
var SectorCounter;
// Regular, Corrupt, Valuable
var count = [0, 0, 0];

setTimeout(() => {
    console.log("starting");
    let bonusPanel = document.querySelectorAll('[id^="bonus-panel"]')[0];
    bonusPanel.innerHTML =
        '<div id="sector_counter"></div>' + bonusPanel.innerHTML;

    let tiles = document.querySelectorAll('[id^="tile_wrapper"]');
    SectorCounter = document.querySelectorAll('[id^="sector_counter"]')[0];

    if (tiles) {
        // Count current blocks
        tiles.forEach((tile) => {
            let tileType = tile.innerText.replace(/[^⚙︎^$︎^▓︎]/g, "");
            countBlocks(tileType);

            // Blocks add themselves to the count when mined
            new MutationObserver((mutation, observer) => {
                let tileType = tile.innerText.replace(/[^⚙︎^$︎^▓︎]/g, "");
                countBlocks(tileType);
                updateCountHTML();
                observer.disconnect();
            }).observe(tile, { childList: true });
        });
    }
    updateCountHTML();
}, 3000);

function updateCountHTML() {
    SectorCounter.innerHTML =
        "<span class='dirt'>▓︎:" +
        count[0] +
        "</span><span class='junk'>\n⚙︎:" +
        count[1] +
        "</span><span class='valuable'>\n$︎:" +
        count[2] +
        "</span>";
    console.log(count);
}

function countBlocks(tileType) {
    switch (tileType) {
        case "▓︎":
            break;
        case "⚙︎":
            count[1] += 1;
            break;
        case "$︎":
            count[2] += 1;
            break;
        default:
            count[0] += 1;
    }
}
