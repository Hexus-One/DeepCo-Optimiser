(() => {
    // Regular, Corrupt, Valuable
    var count = [0, 0, 0];
    var sectorCounter;
    var bonusPanel;
    var tiles;
    var main;

    // Initialize or load database
    let db = GM_getValue('tileLogs', [['Timestamp', 'TileID', 'TileType', 'DepartmentStats', 'GridSize']]);

    console.log("[TileLogger] starting");
    main = document.querySelector('[id^="grid-panel"]');

    new MutationObserver((mutation, observer) => {
        // console.log(mutation);
        if (mutation[0].attributeName == "complete") {
            bonusPanel = document.querySelector('[id^="bonus-panel"]');
            tiles = document.querySelectorAll('[id^="tile_wrapper"]');

            if (tiles) {
                // Count current blocks
                count = [0, 0, 0];
                tiles.forEach((tile) => {
                    let tileType = tile.innerText.replace(/[^⚙︎$︎▓︎]/g, "");
                    countBlocks(tileType);

                    // Blocks add themselves to the count when mined
                    new MutationObserver((mutation, observer) => {
                        let tileType = tile.innerText.replace(/[^⚙︎$︎▓︎]/g, "");
                        switch (tileType) {
                            case "⚙︎":
                                tileType = "junk";
                                break;
                            case "$︎":
                                tileType = "valuable";
                                break;
                            default:
                                tileType = "dirt";
                        }

                        // Get tile ID
                        const idStr = tile.id || tile.getAttribute('id') || '';
                        const tileId = idStr.replace(/\D/g, '');

                        // Get department stats text
                        let deptStatsEl = document.querySelector('p.department-stats');
                        let deptStats = deptStatsEl ? deptStatsEl.textContent.trim() : '';
                        deptStats = deptStats.replace(/\s+/g, ' ').trim();

                        // Store to database
                        const timestamp = getTimestampForSheets();
                        db.push([timestamp, tileId, tileType, deptStats, tiles.length]);
                        GM_setValue('tileLogs', db);

                        // console.log(`[TileLogger] ${timestamp} | ID: ${tileId} | Type: ${tileType} | Dept: ${deptStats}`);

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
            sectorCounter.style.display = "inline-block";

            let counterDirt = document.createElement("span");
            counterDirt.className = "dirt";
            let counterJunk = document.createElement("span");
            counterJunk.className = "junk";
            let counterValuable = document.createElement("span");
            counterValuable.className = "valuable";
            sectorCounter.appendChild(counterDirt);
            sectorCounter.appendChild(counterJunk);
            sectorCounter.appendChild(counterValuable);

            // ✅ Create button container to go BELOW the counters
            const btnContainer = document.createElement("div");

            // Export button
            const exportBtn = document.createElement("button");
            exportBtn.textContent = "Export CSV";
            exportBtn.style.marginRight = "5px";
            exportBtn.addEventListener("click", exportTileLogs);
            btnContainer.appendChild(exportBtn);

            // Reset button
            const resetBtn = document.createElement("button");
            resetBtn.textContent = "Reset Logs";
            resetBtn.addEventListener("click", resetTileLogs);
            btnContainer.appendChild(resetBtn);

            // Add buttons container below counters
            sectorCounter.appendChild(btnContainer);

            bonusPanel.appendChild(sectorCounter);
        }

        sectorCounter.children[0].innerText = "▓︎:" + count[0];
        sectorCounter.children[1].innerText = " ⚙︎:" + count[1];
        sectorCounter.children[2].innerText = " $︎:" + count[2];
        // console.log(count);
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

    function exportTileLogs() {
        let logs = GM_getValue('tileLogs', []);
        if (!logs || logs.length === 0) {
            alert('No logs to export!');
            return;
        }

        // Convert to CSV
        const csvContent = logs.map(row => row.map(val => `"${val}"`).join(",")).join("\n");

        // Trigger download
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `tileLogs_${new Date().toISOString().replace(/[:.]/g, "_")}.csv`;
        a.click();

        URL.revokeObjectURL(url);
    }

    function resetTileLogs() {
        if (confirm('Are you sure you want to clear all tile logs?')) {
            // Clear the in-memory copy
            db = [['Timestamp', 'TileID', 'TileType', 'DepartmentStats', 'GridSize']];

            // Clear Tampermonkey storage too
            GM_setValue('tileLogs', db);
            alert('Tile logs have been cleared.');
        }
    }

    function getTimestampForSheets() {
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
})();
