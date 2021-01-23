

async function loadNewBounds()
{
    let newtloc = (await axios.get("https://gist.githubusercontent.com/kristofbolyai/74aa74b5554430112a55d0687f0bb5a1/raw/d46ed9c080127fe95d7338f0ebea37f90a92ee0e/newterrs.json")).data;
    let newd = {};
    for (const x in newtloc) {
        if (newtloc[x].start)
        {
            newd[x] = {};
            newd[x].start = newtloc[x].start.replace(",", " ").replace(/ +(?= )/g,'').replace(" ", ",");
            newd[x].end = newtloc[x].end.replace(",", " ").replace(/ +(?= )/g,'').replace(" ", ",");
        }
    } 
    
    console.log("Loaded territory bounds from gist!");

    return newd;
}