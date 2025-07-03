(() => {
    // Regular, Corrupt, Valuable
    var count = [0, 0, 0];
    var sectorCounter;
    var bonusPanel;
    var tiles;
    var main;

    console.log("starting");
    main = document.querySelector('[id^="grid-panel"]');

    new MutationObserver((mutation, observer) => {
        console.log(mutation);
        if (mutation[0].attributeName == "complete") {
            bonusPanel = document.querySelector('[id^="bonus-panel"]');
            tiles = document.querySelectorAll('[id^="tile_wrapper"]');

            if (tiles) {
                // Count current blocks
                count = [0, 0, 0];
                tiles.forEach((tile) => {
                    let tileType = tile.innerText.replace(/[^⚙︎^$︎^▓︎]/g, "");
                    countBlocks(tileType);

                    // Blocks add themselves to the count when mined
                    new MutationObserver((mutation, observer) => {
                        let tileType = tile.innerText.replace(
                            /[^⚙︎^$︎^▓︎]/g,
                            ""
                        );
                        countBlocks(tileType);
                        updateCountHTML();
                        observer.disconnect();
                    }).observe(tile, { childList: true });
                });
                updateCountHTML();
            }
        }
    }).observe(main, { attributes: true });

    const updateCountHTML = () => {
        sectorCounter = document.querySelector('[id^="sector_counter"]');
        if (!sectorCounter) {
            sectorCounter = document.createElement("div");
            sectorCounter.id = "sector_counter";
            let counterDirt = document.createElement("span");
            counterDirt.className = "dirt";
            let counterJunk = document.createElement("span");
            counterJunk.className = "junk";
            let counterValuable = document.createElement("span");
            counterValuable.className = "valuable";
            sectorCounter.appendChild(counterDirt);
            sectorCounter.appendChild(counterJunk);
            sectorCounter.appendChild(counterValuable);

            bonusPanel.prepend(sectorCounter);
        }

        sectorCounter.children[0].innerText = "▓︎:" + count[0];
        sectorCounter.children[1].innerText = " ⚙︎:" + count[1];
        sectorCounter.children[2].innerText = " $︎:" + count[2];
        console.log(count);
    };

    const countBlocks = (tileType) => {
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
    };
})();
