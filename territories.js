async function loadTerrData()
{
    //https://gist.githubusercontent.com/kristofbolyai/87ae828ecc740424c0f4b3749b2287ed/raw/57cf91c874e7fa6814f0675736678d8dc3f9b4f4/territories.json

    let newTerritoryData = (await axios.get("https://gist.githubusercontent.com/kristofbolyai/87ae828ecc740424c0f4b3749b2287ed/raw/57cf91c874e7fa6814f0675736678d8dc3f9b4f4/territories.json")).data;

    console.log("Loaded territory data from gist!");

    return newTerritoryData;
}

