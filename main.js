var Territories = {};
var Guilds = [];
let rectangles = [];
var selectedTerritory = [];
var actual_JSON;
var markers = [];
var map;
var visible = false;
let territories;

let newTerritoryData, newtloc;


let terrmode = true; //terr map is true res map if false 
let latestterrdata;

$(document).ready(async function () {
    // Help popup
    $(function () {
        $('#help').popover({
            trigger: 'focus'
        })
    })
    newTerritoryData = await loadTerrData();
    //newtloc = await loadNewBounds();
    initTerrs();
});


function removeselections() {
    selectedTerritory = [];
    reloadMenu();
}


function initTerrs() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            territories = JSON.parse(this.responseText);
            for (let i in territories) {
                Territories[i] = null;
            }
            run();
        }
    };
    xhttp.open("GET", "https://gist.githubusercontent.com/kristofbolyai/bd3c5d30fbe93a4804f8c868e90dc44e/raw/9378bc35730db4cc7e5949489dc4e7eb3d537934/terrs", true);
    xhttp.send();
}

async function run() {
    // initializing map
    let images = [];

    map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 1,
        zoomControl: false,
        zoom: 1
    });

    //map.on('click', onclickevent);


    var bounds = [[0, 0], [6485, 4091]];
    var image = L.imageOverlay('./tiles/main-map.png', bounds).addTo(map);

    map.fitBounds(bounds);

    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    //initializing variables
    let prevZoom = 7;

    //setting up territories
    //let data = (await axios.get("https://api.wynncraft.com/public_api.php?action=territoryList")).data.territories;
    //let json = {};
    for (let name in territories) {
        let territory = territories[name];
        let bounds = [territory.start.split(","), territory.end.split(",")];

        /*json[name] = {};
        json[name].start = bounds[0].toString();
        json[name].end = bounds[1].toString();*/

        bounds[0].reverse();
        bounds[1].reverse();

        bounds[0][0] *= -1;
        bounds[1][0] *= -1;

        bounds[0][1] = parseInt(bounds[0][1]) + 2393;
        bounds[1][1] = parseInt(bounds[1][1]) + 2393;

        bounds[0][0] = parseInt(bounds[0][0]) - 130;
        bounds[1][0] = parseInt(bounds[1][0]) - 130;

        let rectangle = L.rectangle(bounds,
            { color: "rgb(0, 0, 0, 0)", weight: 2 })
        rectangles[name] = rectangle;
        rectangle.on('click', function () {
            if (selmode) {
                if (!selected.includes(territory.name))
                    selected.push(territory.name);
                else {
                    selected = selected.filter(x => x !== territory.name);
                }
            }
            updatesel();
        });
        rectangle.addTo(map);
    }

    //console.log(JSON.stringify(json));

    setTimeout(async () => {
        while (true) {
            if (terrmode) {
                try {
                    let data = (await axios.get("https://api.wynncraft.com/public_api.php?action=territoryList")).data.territories;
                    if (data) {
                        latestterrdata = data;
                        console.log("Got new territory data!");
                        render();
                    }
                } catch (error) {
                    console.log("error fetching terr data", error);
                }
            }
            await new Promise(r => setTimeout(r, 6000));
        }
    }, 1);

    while (!latestterrdata)
        await new Promise(r => setTimeout(r, 100));

    render();
    reloadLegend();

    //on zoom end, update map based on zoom
    map.on('zoomend', () => {
        prevZoom = map.getZoom();
        setTimeout(render, 500);
    });

    //setInterval(render, 2000)
}

function drawBetween(g1, g2, directional) {
    if (!g1 || !g2) {
        console.log("not drawing line, terr does not exist");
        return false;
    }
    let territory1 = territories[g1];
    let territory2 = territories[g2];
    if (!territory1 || !territory2) {
        console.log("not drawing line, terr does not exist", g1, g2);
        return false;
    }


    //
    let bounds = [[], []];
    let smaller, bigger;
    let f = parseInt(territory1["start"].split(",")[0]);
    let s = parseInt(territory1["end"].split(",")[0]);
    if (f > s) {
        smaller = s;
        bigger = f;
    }
    else {
        smaller = f;
        bigger = s;
    }
    let diffx = bigger - smaller;
    diffx /= 2;
    bounds[0].push(bigger - diffx);

    //
    f = parseInt(territory1["start"].split(",")[1]);
    s = parseInt(territory1["end"].split(",")[1]);
    if (f > s) {
        smaller = s;
        bigger = f;
    }
    else {
        smaller = f;
        bigger = s;
    }
    let diffz = bigger - smaller;
    diffz /= 2;
    bounds[0].push(bigger - diffz);

    f = parseInt(territory2["start"].split(",")[0]);
    s = parseInt(territory2["end"].split(",")[0]);
    if (f > s) {
        smaller = s;
        bigger = f;
    }
    else {
        smaller = f;
        bigger = s;
    }
    diffx = bigger - smaller;
    diffx /= 2;
    bounds[1].push(bigger - diffx);

    f = parseInt(territory2["start"].split(",")[1]);
    s = parseInt(territory2["end"].split(",")[1]);
    if (f > s) {
        smaller = s;
        bigger = f;
    }
    else {
        smaller = f;
        bigger = s;
    }
    diffz = bigger - smaller;
    diffz /= 2;
    bounds[1].push(bigger - diffz);

    bounds[0].reverse();
    bounds[1].reverse();

    bounds[0][0] *= -1;
    bounds[1][0] *= -1;

    bounds[0][1] = parseInt(bounds[0][1]) + 2393;
    bounds[1][1] = parseInt(bounds[1][1]) + 2393;

    bounds[0][0] = parseInt(bounds[0][0]) - 130;
    bounds[1][0] = parseInt(bounds[1][0]) - 130;

    if (index >= colors.length)
        index = 0;
    if (selected.includes(g2) && selected.includes(g1)) {
        if (directional)
            return L.polyline(bounds, { color: colors[2] }).arrowheads({ size: "10px" }).addTo(map);
        else
            return L.polyline(bounds, { color: colors[3] }).addTo(map);
    }
    else {
        if (directional)
            return L.polyline(bounds, { color: colors[1] }).arrowheads({ size: "10px" }).addTo(map);
        else
            return L.polyline(bounds, { color: colors[0] }).addTo(map);
    }
}

let colors = ['red', 'darkred', 'darkblue', 'blue'];
let index = 0;

function drawRoutes() {
    for (const name in newTerritoryData) {
        let x = newTerritoryData[name];
        for (const route of x.Routes) {
            try {
                setTimeout(() => {
                    let r = drawBetween(name, route, !newTerritoryData[route].Routes.includes(name));
                    if (r)
                        routes.push(r);
                }, 0);
            } catch (error) {
                console.log("error drawing between", route, name)
            }

        }
    }
}

function reloadLegend() {

}
function reloadMenu() {
    // Change menu to territory
    var terr = document.getElementById('currentTerritory');
    terr.innerText = selectedTerritory;
    if (selectedTerritory.length > 5) {
        terr.innerText = "Selected more than 5 territories";
    }
    if (selectedTerritory.length === 0) {
        terr.innerText = "Select 1 or more territory to edit";
        var enableButton = document.getElementById('enable-button');
        var terrSelector = document.getElementById('terr-select');
        enableButton.style.visibility = 'hidden'
        terrSelector.style.visibility = 'hidden'
        return;
    }

    // Show options
    var enableButton = document.getElementById('enable-button');
    var terrSelector = document.getElementById('terr-select');
    enableButton.style.visibility = 'visible'
    terrSelector.style.visibility = 'visible'

    // Show correct options
    //var territoryToggle = document.getElementById('territory-toggle');
    var guildSelect = document.getElementById('guilds');
    // Clear guild select
    var length = guildSelect.options.length;
    for (i = length - 1; i >= 0; i--) {
        guildSelect.options[i] = null;
    }
    // Insert current guild select
    var currentOwner = undefined;
    try {
        currentOwner = Territories[selectedTerritory[0]];
    } catch (error) {

    }
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode('--'));
    opt.value = null;
    if (!currentOwner) opt.selected = true;
    guildSelect.appendChild(opt);
    for (let guild of Guilds) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(guild.name));
        opt.value = guild.name;
        if (guild.name === currentOwner) opt.selected = true;
        guildSelect.appendChild(opt);
    }
    reloadLegend();
}

function exportMap() {
    var json = {
        territories: Territories,
        guilds: Guilds
    }
    console.log(json)
    var data = JSON.stringify(json);
    var a = document.createElement("a");
    var file = new Blob([data], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'Map.json';
    a.click();
}

function importMap(evt) {
    var file = evt.target.files[0];

    var reader = new FileReader();
    reader.onload = function (file) {
        // Reset values
        Guilds = [];
        Territories = [];
        // Get data
        var data = JSON.parse(file.target.result);
        console.log(data);
        // Check if file is valid
        if (!data.territories || !data.guilds) return alert('Error: Invalid map save file provided')
        // Change data in the html
        Territories = data.territories;
        // Change html
        let repeat = false;
        for (let i in data.guilds) {
            if (Guilds.filter(g => g.name === data.guilds[i].name)[0]) repeat = true
            else Guilds.push(new Guild(data.guilds[i].name, data.guilds[i].mapcolor))
        }
        if (repeat) alert("There are errors in your map file! We have attempted to fix them, but please make sure to check if anything went wrong.")
        render();
    }
    reader.readAsText(file);
}

function pullApi() {
    var c = confirm('WARNING: This will remove all current data. To save, press the Export button.');
    if (!c) return;
    var apiLoading = document.getElementById('api-loading');
    apiLoading.innerText = 'Loading... (This may take a long time)\nFetching the territory list...';
    Territories = {};
    Guilds = [];
    $('#changeguild').empty().append('<option selected="selected" value="null">--</option>');
    $('#removeguild').empty().append('<option selected="selected" value="null">--</option>');

    fetch('https://api.wynncraft.com/public_api.php?action=territoryList')
        .then(res => res.json())
        .then(json => {
            let territories = json.territories;
            let guilds = [];
            let guildPrefixes = {};
            let longest = 0;
            for (let i in territories) {
                apiLoading.innerText = 'Loading... (This may take a long time)\nProcessing data...'
                setTimeout(function () {
                    if (guildPrefixes[territories[i].guild]) {
                        Territories[i] = guildPrefixes[territories[i].guild]
                        return;
                    }
                    let found = false;
                    if (actual_JSON) {
                        for (let j = 0; j < actual_JSON["guild"].length; j++) {
                            if (actual_JSON["guild"][j] === territories[i].guild) {
                                Territories[i] = actual_JSON["tag"][j];
                                if (!guilds.includes(actual_JSON["tag"][j])) guilds.push(actual_JSON["tag"][j]);
                                if (!guildPrefixes[territories[i].guild]) guildPrefixes[territories[i].guild] = actual_JSON["tag"][j];
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        apiLoading.innerText = 'Loading... (This may take a long time)\nGuild missing in cache! Fetching Wynn API...'
                        longest++;
                        fetch(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${territories[i].guild}`)
                            .then(res => res.json())
                            .then(json => {
                                Territories[i] = json.prefix;
                                if (!guilds.includes(json.prefix)) guilds.push(json.prefix);
                                if (!guildPrefixes[territories[i].guild]) guildPrefixes[territories[i].guild] = json.prefix;
                            })
                    }
                }, longest * 250)
            }
            setTimeout(function () {
                Guilds = [];
                guilds.forEach(g => {
                    Guilds.push(new Guild(g, "#000000".replace(/0/g, _ => (~~(Math.random() * 16)).toString(16))));
                });
                apiLoading.innerText = 'Loaded!';
                setTimeout(render, 2000);
                alert('Wynn API has finished loading. Feel free to change around colors and territories.')
            }, longest * 250 + 1000)
        })
}

function checkRectOverlap(rect1, rect2) {
    /*
     * Each array in parameter is one rectangle
     * in each array, there is an array showing the co-ordinates of two opposite corners of the rectangle
     * Example:
     * [[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]
     */

    //Check whether there is an x overlap
    if ((rect1[0][0] < rect2[0][0] && rect2[0][0] < rect1[1][0]) //Event that x3 is inbetween x1 and x2
        || (rect1[0][0] < rect2[1][0] && rect2[1][0] < rect1[1][0]) //Event that x4 is inbetween x1 and x2
        || (rect2[0][0] < rect1[0][0] && rect1[1][0] < rect2[1][0])) {  //Event that x1 and x2 are inbetween x3 and x4
        //Check whether there is a y overlap using the same procedure
        if ((rect1[0][1] < rect2[0][1] && rect2[0][1] < rect1[1][1]) //Event that y3 is between y1 and y2
            || (rect1[0][1] < rect2[1][1] && rect2[1][1] < rect1[1][1]) //Event that y4 is between y1 and y2
            || (rect2[0][1] < rect1[0][1] && rect1[1][1] < rect2[1][1])) { //Event that y1 and y2 are between y3 and y4
            return true;
        }
    }
    return false;
}

function render() {
    console.log("RENDERING");  
    //if (!visible) changeVisibility();
    if (terrmode) {
        let guilds = new Set();
        for (const x in latestterrdata) {
            guilds.add(latestterrdata[x].guild);
        }
        let guildsarray = Array.from(guilds.values());
        let tags = {};
        for (const guild of guildsarray) {
            setTimeout(async () => {
                let tag = await getTag(guild);
                tags[guild] = tag;
                Object.keys(latestterrdata).filter(x => latestterrdata[x].guild === guild).forEach(async territory => {
                    try {
                        rectangles[territory].unbindTooltip();
                        rectangles[territory].unbindPopup();
                        let c;
                        let oldtn = territory;
                        territory = territory.replace('’', "'");
                        if (newTerritoryData[territory]) {
                            let x = newTerritoryData[territory];
                            if (!selmode)
                                rectangles[oldtn].bindPopup(`<b>${territory}</b><br>${latestterrdata[territory].guild}`);

                        }

                        if (colormap.has(latestterrdata[territory].guild))
                            c = colormap.get(latestterrdata[territory].guild);
                        else {
                            c = '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
                            colormap.set(latestterrdata[territory].guild, c);
                        }

                        if (selected.includes(territory))
                            c = green;

                        if (visible && map.getZoom() >= -1)
                            rectangles[territory].bindTooltip(`<span class="territoryGuildName" style="color: ${c}">${territory}\n[${tags[latestterrdata[territory].guild]}]</span>`, { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
                        else
                            rectangles[territory].bindTooltip(`<span class="territoryGuildName" style="color: ${c}">${tags[latestterrdata[territory].guild]}</span>`, { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 });


                        rectangles[oldtn].setStyle({
                            fillColor: c,
                            color: c
                        });
                    } catch (error) {
 
                    }
                });
            }, 0);
        }
    }
    else {
        Object.keys(Territories).forEach(territory => {
            rectangles[territory].unbindTooltip();
            rectangles[territory].unbindPopup();
            if (map.getZoom() >= -1 && visible)
                rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: #FFFFFF">' + territory + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
            let c;
            let oldtn = territory;
            territory = territory.replace('’', "'");
            if (newTerritoryData[territory]) {
                let x = newTerritoryData[territory];
                if (!selmode) {
                    let restext = "";
                    for (const res of x.Resources) {
                        restext += `${res} `;
                    }
                    rectangles[oldtn].bindPopup(`<b>${territory}</b><br><b>${x.DoubleEmerald ? "DOUBLE " : ""} Emerald production: ${x.DoubleEmerald ? 18000 : 9000}/h</b><br><b>${x.DoubleResource ? "DOUBLE " : ""}Resources:</b><br>${restext}<br><b>Trade routes:</b><br>${x.Routes.toString().replaceAll(",", "<br>")}`);
                }
                if (x.Resources.length > 1) {
                    c = red;
                }
                else {
                    switch (x.Resources[0]) {
                        case "Wood":
                            c = brown;
                            break;
                        case "Ore":
                            c = gray;
                            break;
                        case "Fish":
                            c = blue;
                            break;
                        case "Crops":
                            c = yellow;
                            break;
                    }
                }
            }
            else
                c = "#ffffff";
            if (selected.includes(territory))
                c = green;
            rectangles[oldtn].setStyle({
                fillColor: c,
                color: newTerritoryData[territory].DoubleEmerald || newTerritoryData[territory].DoubleResource ? "lightgreen" : c
            });
        });
    }
    reloadLegend();
}

let red = "#e80c0c";
let blue = "#0f1ddb";
let brown = "#45160a";
let yellow = "#fffb17";
let gray = "#82827c";
let green = '#09d60f';

function changeVisibility() {
    Object.keys(Territories).forEach(async territory => {
        rectangles[territory].unbindTooltip();
        let c;
        if (colormap.has(latestterrdata[territory].guild))
            c = colormap.get(latestterrdata[territory].guild);
        else {
            c = '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            colormap.set(latestterrdata[territory].guild, c);
        }

        if (selected.includes(territory))
            c = green;
        //let tag = await getTag(latestterrdata[territory].guild);
        let tag = "???";
        rectangles[territory].bindTooltip(`<span class="territoryGuildName" style="color: ${c}">${tag}</span>`, { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 });
    });
}

let routesOn = false;
let routes = [];

function showr() {
    routesOn = !routesOn;
    if (routesOn)
        document.getElementById("showr").value = "Hide routes";
    else
        document.getElementById("showr").value = "Show routes";

    if (routesOn) {
        drawRoutes();
    }
    else {
        for (const x of routes) {
            try {
                map.removeLayer(x);
            } catch (error) {

            }
        }
        routes = [];
    }
}

function shownames() {
    visible = !visible;
    if (visible)
        document.getElementById("shown").value = "Hide territory names";
    else
        document.getElementById("shown").value = "Show territory names";

    render();
}

let selected = [];
let selmode = false;

function sel() {
    selmode = !selmode;
    if (!selmode) {
        document.getElementById("sel").value = "Turn on select mode";
        selected = [];
        updatesel();
    }
    else
        document.getElementById("sel").value = "Turn off select mode";
}

function updatesel() {
    setTimeout(render, 1);
    for (const x of routes) {
        try {
            map.removeLayer(x);
        } catch (error) {

        }
    }
    routes = [];
    if (routesOn) {
        drawRoutes();
    }
    var ul = document.getElementById("sellist");
    var selc = document.getElementById("selcount");
    selc.innerText = `Selected territories (${selected.length})`;
    ul.innerHTML = '';
    for (const x of selected) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(x));
        ul.appendChild(li);
    }
}

function copy() {
    updateClipboard(btoa(selected.toString()));
}

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function () {
        /* clipboard successfully set */
    }, function () {
        /* clipboard write failed */
    });
}

function changemode() {
    terrmode = !terrmode;
    let button = document.getElementById("changemode");
    button.value = !terrmode ? "Change to: Territory map" : "Change to: Resource map";
    render();
}

let tagCache = {};

async function getTag(name) {
    if (!name)
        return "???";
    if (tagCache.hasOwnProperty(name))
        return tagCache[name];

    try {
        console.log("request", name);
        let data = (await fetch("https://api.wynncraft.com/public_api.php?action=guildStats&command=" + name, { mode: 'cors' }));
        let json = await data.json();
        tagCache[name] = json.prefix;
        return json.prefix;
    } catch (error) {
        console.log("error fetching guild", name)
    }

    return "???";
}