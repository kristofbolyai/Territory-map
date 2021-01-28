let colordata = {
    "Emorians":"#005FE8",
    "Avicia":"#1010FE",
    "ShadowFall":"#67178a",
    "Kingdom Foxes":"#FF8200",
    "Fantasy":"#21C8EC",
    "Lux Nova":"#9c3f91",
    "TheNoLifes":"#1b7529",
    "The Simple Ones":"#0fCAD6",
    "Nefarious Ravens":"#444444",
};

let colormap = new Map();

for (const guild in colordata) {
    colormap.set(guild, colordata[guild]);
}

