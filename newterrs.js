

async function loadNewBounds()
{
    let newtloc = (await axios.get("https://gist.githubusercontent.com/kristofbolyai/74aa74b5554430112a55d0687f0bb5a1/raw/d3573f178af41a5a9823f672ccb21e87c0c7ac6b/newterrs.json")).data;
    if (typeof newtloc == "string")
    {
        newtloc = JSON.parse(newtloc);
    }
    let newd = {};
    for (const x in newtloc) {
        if (newtloc[x].start)
        {
            newd[x] = {};
            newd[x].start = newtloc[x].start.replace(",", " ").replace(/ +(?= )/g,'').replace(" ", ",");
            newd[x].end = newtloc[x].end.replace(",", " ").replace(/ +(?= )/g,'').replace(" ", ",");
            if (newd[x].start == "")
                newd[x] = undefined;
        }
    } 
    
    console.log("Loaded territory bounds from gist!");

    return newd;
}