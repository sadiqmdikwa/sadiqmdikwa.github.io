import Papa from "papaparse";

export interface CountryData {
  name: string;
  code: string;
  capital?: string;
  population?: string;
  region: string;
  area: string;
  languages?: string;
  desc?: string;
  wikiUrl?: string;
  lat: number;
  lng: number;
}

export interface GlobeQuizItem {
  id: string;
  countryName: string;
  code: string;
  capital: string;
  population?: string;
  region: string;
  promptType: "flag" | "country" | "capital";
  lat: number;
  lng: number;
}

// Published CSV URLs for GlobeExplorer (gid=0) and GlobeGame (gid=1897290794)
export const GLOBE_EXPLORER_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=0&single=true&output=csv";
export const GLOBE_GAME_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=1897290794&single=true&output=csv";

export const COUNTRY_DATABASE: { [key: string]: CountryData } = {
  "Democratic Republic of the Congo": {
    name: "Democratic Republic of the Congo",
    code: "CD",
    capital: "Kinshasa",
    population: "99,010,000 people",
    region: "Africa • Central Africa",
    area: "2,344,858 km²",
    languages: "French, Lingala, Swahili",
    desc: "The Democratic Republic of the Congo (DRC) is the second-largest country in Africa by area and the 11th-largest globally. Centered in the heart of the continent, it is dominated by the dense Congo Rainforest and the immense Congo River basin, possessing unrivaled biodiversity and natural mineral wealth.",
    wikiUrl: "https://en.wikipedia.org/wiki/Democratic_Republic_of_the_Congo",
    lat: -4.0383,
    lng: 21.7587
  },
  "Congo": {
    name: "Republic of the Congo",
    code: "CG",
    capital: "Brazzaville",
    population: "5,835,000 people",
    region: "Africa • Central Africa",
    area: "342,000 km²",
    languages: "French, Lingala",
    desc: "The Republic of the Congo is located in the western part of Central Africa, bounded by Gabon, Cameroon, the Central African Republic, the DRC, and the Atlantic Ocean.",
    wikiUrl: "https://en.wikipedia.org/wiki/Republic_of_the_Congo",
    lat: -0.228,
    lng: 15.8277
  },
  "Colombia": {
    name: "Colombia",
    code: "CO",
    capital: "Bogotá",
    population: "51,520,000 people",
    region: "Americas • South America",
    area: "1,141,748 km²",
    languages: "Spanish",
    desc: "Colombia is a country at the northern tip of South America. It is characterized by its diverse topography, including the Andes mountains, Amazonian rainforest, and both Caribbean and Pacific coastlines. Renowned for its rich biodiversity, coffee, and vibrant cultural heritage, Colombia stands as a major geopolitical bridge between Central and South America.",
    wikiUrl: "https://en.wikipedia.org/wiki/Colombia",
    lat: 4.5709,
    lng: -74.2973
  },
  "Nigeria": {
    name: "Nigeria",
    code: "NG",
    capital: "Abuja",
    population: "218,541,212 people",
    region: "Africa • Western Africa",
    area: "923,768 km²",
    languages: "English",
    desc: "Located in West Africa, Nigeria is the most populous nation on the continent and Africa's largest economy. It features a rich mosaic of over 250 ethnic groups, diverse ecological zones ranging from tropical mangrove swamps to arid sahel savannahs, and a burgeoning tech and cultural hub.",
    wikiUrl: "https://en.wikipedia.org/wiki/Nigeria",
    lat: 9.082,
    lng: 8.6753
  },
  "Mali": {
    name: "Mali",
    code: "ML",
    capital: "Bamako",
    population: "21,900,000 people",
    region: "Africa • Western Africa",
    area: "1,240,192 km²",
    languages: "French, Bambara",
    desc: "Mali is a landlocked country in West Africa. It is the eighth-largest country in Africa, sharing borders with Algeria, Niger, Burkina Faso, Ivory Coast, Guinea, Senegal, and Mauritania. Its history is deeply intertwined with ancient trans-Saharan trade and legendary cities like Timbuktu.",
    wikiUrl: "https://en.wikipedia.org/wiki/Mali",
    lat: 17.5707,
    lng: -3.9962
  },
  "Algeria": {
    name: "Algeria",
    code: "DZ",
    capital: "Algiers",
    population: "44,900,000 people",
    region: "Africa • Northern Africa",
    area: "2,381,741 km²",
    languages: "Arabic, Berber",
    desc: "Algeria is the largest country in Africa by land area. Situated in North Africa, more than four-fifths of its territory is covered by the Sahara Desert, while its Mediterranean coastline features fertile plains and historical ports.",
    wikiUrl: "https://en.wikipedia.org/wiki/Algeria",
    lat: 28.0339,
    lng: 1.6596
  },
  "Niger": {
    name: "Niger",
    code: "NE",
    capital: "Niamey",
    population: "25,250,000 people",
    region: "Africa • Western Africa",
    area: "1,267,000 km²",
    languages: "French, Hausa",
    desc: "Niger is a landlocked country named after the Niger River. It is bounded by Libya to the northeast, Chad to the east, Nigeria to the south, Benin and Burkina Faso to the southwest, Mali to the west, and Algeria to the northwest. It holds immense strategic importance in the Sahel region.",
    wikiUrl: "https://en.wikipedia.org/wiki/Niger",
    lat: 17.6078,
    lng: 8.0817
  },
  "Chad": {
    name: "Chad",
    code: "TD",
    capital: "N'Djamena",
    population: "17,180,000 people",
    region: "Africa • Central Africa",
    area: "1,284,000 km²",
    languages: "French, Arabic",
    desc: "Chad is a landlocked country at the crossroads of North and Central Africa. It is named after Lake Chad, the second-largest wetland in Africa. The country spans diverse climatic zones from desert in the north to tropical savanna in the south.",
    wikiUrl: "https://en.wikipedia.org/wiki/Chad",
    lat: 15.4542,
    lng: 18.7322
  },
  "Sudan": {
    name: "Sudan",
    code: "SD",
    capital: "Khartoum",
    population: "45,660,000 people",
    region: "Africa • Northern Africa",
    area: "1,886,068 km²",
    languages: "Arabic, English",
    desc: "Sudan is a country in Northeast Africa. It is bounded by Egypt to the north, the Red Sea to the northeast, Eritrea and Ethiopia to the east, South Sudan to the south, the Central African Republic to the southwest, Chad to the west, and Libya to the northwest. It is crossed by the majestic Nile River.",
    wikiUrl: "https://en.wikipedia.org/wiki/Sudan",
    lat: 12.8628,
    lng: 30.2176
  },
  "Senegal": {
    name: "Senegal",
    code: "SN",
    capital: "Dakar",
    population: "16,880,000 people",
    region: "Africa • Western Africa",
    area: "196,712 km²",
    languages: "French, Wolof",
    desc: "Senegal is the westernmost country in the mainland of the Old World, caressed by the Atlantic Ocean. Renowned for its stable democracy, vibrant cultural arts, and historical capital of Dakar, it serves as a cultural beacon in West Africa.",
    wikiUrl: "https://en.wikipedia.org/wiki/Senegal",
    lat: 14.4974,
    lng: -14.4524
  },
  "Ghana": {
    name: "Ghana",
    code: "GH",
    capital: "Accra",
    population: "32,830,000 people",
    region: "Africa • Western Africa",
    area: "238,535 km²",
    languages: "English",
    desc: "Ghana is a nation along the West African coast of the Gulf of Guinea. Spanning diverse ecosystems, it is celebrated for its rich history of the Ashanti Empire, gold and cocoa exports, and robust democratic institutions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Ghana",
    lat: 7.9465,
    lng: -1.0232
  },
  "Morocco": {
    name: "Morocco",
    code: "MA",
    capital: "Rabat",
    population: "37,080,000 people",
    region: "Africa • Northern Africa",
    area: "446,550 km²",
    languages: "Arabic, Berber",
    desc: "Morocco is a North African nation bordering the Atlantic Ocean and Mediterranean Sea, distinguished by its ancient medinas, Atlas Mountains, and vibrant blend of Berber, Arab, and European cultures.",
    wikiUrl: "https://en.wikipedia.org/wiki/Morocco",
    lat: 31.7917,
    lng: -7.0926
  },
  "Ethiopia": {
    name: "Ethiopia",
    code: "ET",
    capital: "Addis Ababa",
    population: "120,300,000 people",
    region: "Africa • Eastern Africa",
    area: "1,104,300 km²",
    languages: "Amharic",
    desc: "Ethiopia is a rugged, landlocked country in the Horn of Africa. With archaeological finds dating back more than 3 million years, it is widely considered one of the cradles of humankind and never formally colonized.",
    wikiUrl: "https://en.wikipedia.org/wiki/Ethiopia",
    lat: 9.145,
    lng: 40.4897
  },
  "Kenya": {
    name: "Kenya",
    code: "KE",
    capital: "Nairobi",
    population: "53,010,000 people",
    region: "Africa • Eastern Africa",
    area: "580,367 km²",
    languages: "Swahili, English",
    desc: "Kenya lies on the equator with a coastline on the Indian Ocean. It encompasses savannahs, lakelands, the dramatic Great Rift Valley, and incredible wildlife reserves like the Maasai Mara.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kenya",
    lat: -0.0236,
    lng: 37.9062
  },
  "United States of America": {
    name: "United States",
    code: "US",
    capital: "Washington, D.C.",
    population: "333,287,557 people",
    region: "Americas • North America",
    area: "9,833,520 km²",
    languages: "English",
    desc: "The United States is a North American nation consisting of 50 states, a federal district, and major territories. It spans from the Atlantic to the Pacific ocean, encompassing immense geographic and cultural diversity.",
    wikiUrl: "https://en.wikipedia.org/wiki/United_States",
    lat: 37.0902,
    lng: -95.7129
  },
  "United Kingdom": {
    name: "United Kingdom",
    code: "GB",
    capital: "London",
    population: "67,596,281 people",
    region: "Europe • Northern Europe",
    area: "242,495 km²",
    languages: "English",
    desc: "The United Kingdom is an island nation in northwestern Europe comprising England, Scotland, Wales, and Northern Ireland, with a profound global legacy in science, literature, and governance.",
    wikiUrl: "https://en.wikipedia.org/wiki/United_Kingdom",
    lat: 55.3781,
    lng: -3.4360
  },
  "France": {
    name: "France",
    code: "FR",
    capital: "Paris",
    population: "64,756,584 people",
    region: "Europe • Western Europe",
    area: "551,695 km²",
    languages: "French",
    desc: "France, in Western Europe, encompasses medieval cities, alpine villages, and Mediterranean beaches. Paris, its capital, is famous for fashion, classical art museums, and historical monuments.",
    wikiUrl: "https://en.wikipedia.org/wiki/France",
    lat: 46.2276,
    lng: 2.2137
  },
  "Germany": {
    name: "Germany",
    code: "DE",
    capital: "Berlin",
    population: "83,369,843 people",
    region: "Europe • Central Europe",
    area: "357,022 km²",
    languages: "German",
    desc: "Germany is a Western European country with a landscape of forests, rivers, mountain ranges, and centuries of rich philosophical, industrial, and artistic history.",
    wikiUrl: "https://en.wikipedia.org/wiki/Germany",
    lat: 51.1657,
    lng: 10.4515
  },
  "Spain": {
    name: "Spain",
    code: "ES",
    capital: "Madrid",
    population: "47,420,000 people",
    region: "Europe • Southern Europe",
    area: "505,990 km²",
    languages: "Spanish",
    desc: "Spain is a European nation on the Iberian Peninsula comprising 17 autonomous regions with diverse geography, art, and Mediterranean heritage.",
    wikiUrl: "https://en.wikipedia.org/wiki/Spain",
    lat: 40.4637,
    lng: -3.7492
  },
  "Italy": {
    name: "Italy",
    code: "IT",
    capital: "Rome",
    population: "59,110,000 people",
    region: "Europe • Southern Europe",
    area: "301,340 km²",
    languages: "Italian",
    desc: "Italy is a European country with a long Mediterranean coastline that has immensely shaped Western culture and cuisine.",
    wikiUrl: "https://en.wikipedia.org/wiki/Italy",
    lat: 41.8719,
    lng: 12.5674
  },
  "Japan": {
    name: "Japan",
    code: "JP",
    capital: "Tokyo",
    population: "123,951,692 people",
    region: "Asia • Eastern Asia",
    area: "377,975 km²",
    languages: "Japanese",
    desc: "Japan is an island nation in East Asia featuring rugged mountainous terrain, high-tech cities, imperial palaces, and ancient shrines.",
    wikiUrl: "https://en.wikipedia.org/wiki/Japan",
    lat: 36.2048,
    lng: 138.2529
  },
  "Brazil": {
    name: "Brazil",
    code: "BR",
    capital: "Brasília",
    population: "215,313,498 people",
    region: "Americas • South America",
    area: "8,515,767 km²",
    languages: "Portuguese",
    desc: "Brazil is the largest country in South America, spanning from the Amazon Basin in the north to vineyards and massive agricultural plains in the south.",
    wikiUrl: "https://en.wikipedia.org/wiki/Brazil",
    lat: -14.2350,
    lng: -51.9253
  },
  "Argentina": {
    name: "Argentina",
    code: "AR",
    capital: "Buenos Aires",
    population: "45,810,000 people",
    region: "Americas • South America",
    area: "2,780,400 km²",
    languages: "Spanish",
    desc: "Argentina is a massive South American nation covering Andes mountains, glacial lakes, and Pampas grassland.",
    wikiUrl: "https://en.wikipedia.org/wiki/Argentina",
    lat: -38.4161,
    lng: -63.6167
  },
  "Peru": {
    name: "Peru",
    code: "PE",
    capital: "Lima",
    population: "33,720,000 people",
    region: "Americas • South America",
    area: "1,285,216 km²",
    languages: "Spanish, Quechua",
    desc: "Peru is a country in western South America that is home to a section of Amazon rainforest and Machu Picchu, an ancient Incan city high in the Andes.",
    wikiUrl: "https://en.wikipedia.org/wiki/Peru",
    lat: -9.19,
    lng: -75.0152
  },
  "Chile": {
    name: "Chile",
    code: "CL",
    capital: "Santiago",
    population: "19,490,000 people",
    region: "Americas • South America",
    area: "756,102 km²",
    languages: "Spanish",
    desc: "Chile is a long, narrow country extending along South America's western edge, with more than 6,000 km of Pacific coastline.",
    wikiUrl: "https://en.wikipedia.org/wiki/Chile",
    lat: -35.6751,
    lng: -71.543
  },
  "Australia": {
    name: "Australia",
    code: "AU",
    capital: "Canberra",
    population: "26,068,792 people",
    region: "Oceania • Australasia",
    area: "7,692,024 km²",
    languages: "English",
    desc: "Australia is a sovereign country comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands.",
    wikiUrl: "https://en.wikipedia.org/wiki/Australia",
    lat: -25.2744,
    lng: 133.7751
  },
  "South Africa": {
    name: "South Africa",
    code: "ZA",
    capital: "Pretoria / Cape Town",
    population: "59,392,255 people",
    region: "Africa • Southern Africa",
    area: "1,221,037 km²",
    languages: "Zulu, Xhosa, Afrikaans, English",
    desc: "South Africa is the southernmost country on the African continent, marked by several distinct ecosystems and a diverse multicultural society.",
    wikiUrl: "https://en.wikipedia.org/wiki/South_Africa",
    lat: -30.5595,
    lng: 22.9375
  },
  "Canada": {
    name: "Canada",
    code: "CA",
    capital: "Ottawa",
    population: "38,250,000 people",
    region: "Americas • North America",
    area: "9,984,670 km²",
    languages: "English, French",
    desc: "Canada is a country in North America consisting of ten provinces and three territories, spanning from the Atlantic to the Pacific and northward into the Arctic Ocean.",
    wikiUrl: "https://en.wikipedia.org/wiki/Canada",
    lat: 56.1304,
    lng: -106.3468
  },
  "Egypt": {
    name: "Egypt",
    code: "EG",
    capital: "Cairo",
    population: "110,990,103 people",
    region: "Africa • Northern Africa",
    area: "1,010,408 km²",
    languages: "Arabic",
    desc: "Egypt is a transcontinental country spanning the northeast corner of Africa and southwest corner of Asia via a land bridge formed by the Sinai Peninsula.",
    wikiUrl: "https://en.wikipedia.org/wiki/Egypt",
    lat: 26.8206,
    lng: 30.8025
  },
  "India": {
    name: "India",
    code: "IN",
    capital: "New Delhi",
    population: "1,428,627,663 people",
    region: "Asia • Southern Asia",
    area: "3,287,263 km²",
    languages: "Hindi, English",
    desc: "India is a country in South Asia. It is the seventh-largest country by area, the most populous democracy, and a cradle of ancient civilizations.",
    wikiUrl: "https://en.wikipedia.org/wiki/India",
    lat: 20.5937,
    lng: 78.9629
  },
  "China": {
    name: "China",
    code: "CN",
    capital: "Beijing",
    population: "1,412,000,000 people",
    region: "Asia • Eastern Asia",
    area: "9,596,961 km²",
    languages: "Mandarin Chinese",
    desc: "China is a country in East Asia. It is the world's most populous nation, with a landscape encompassing vast grasslands, deserts, mountains, and river basins.",
    wikiUrl: "https://en.wikipedia.org/wiki/China",
    lat: 35.8617,
    lng: 104.1954
  }
};

export async function loadLiveGlobeCountries(): Promise<{ [key: string]: CountryData }> {
  try {
    const res = await fetch(GLOBE_EXPLORER_CSV_URL);
    if (!res.ok) return COUNTRY_DATABASE;

    const text = await res.text();
    const parsed = Papa.parse<string[]>(text, { header: false, skipEmptyLines: "greedy" });
    const liveMap: { [key: string]: CountryData } = { ...COUNTRY_DATABASE };

    parsed.data.slice(1).forEach(cols => {
      const name = cols[1]?.replace(/"/g, "").trim();
      const code = cols[2]?.replace(/"/g, "").trim();
      const capital = cols[3]?.replace(/"/g, "").trim();
      const population = cols[4]?.replace(/"/g, "").trim();
      const region = cols[5]?.replace(/"/g, "").trim();
      const area = cols[6]?.replace(/"/g, "").trim();
      const languages = cols[7]?.replace(/"/g, "").trim();
      const desc = cols[8]?.replace(/"/g, "").trim();
      const lat = parseFloat(cols[9]);
      const lng = parseFloat(cols[10]);

      if (name) {
        liveMap[name] = {
          name,
          code: code || "UN",
          capital: capital || "Capital Region",
          population: population || "Estimated 10M+ people",
          region: region || "Global Frontier",
          area: area || "50,000+ km²",
          languages: languages || "Official / Regional",
          desc: desc || `${name} is a sovereign nation.`,
          lat: Number.isFinite(lat) ? lat : 10,
          lng: Number.isFinite(lng) ? lng : 10
        };
      }
    });

    return liveMap;
  } catch (err) {
    console.warn("Using default country database:", err);
    return COUNTRY_DATABASE;
  }
}

export async function loadLiveGlobeGameQuestions(): Promise<GlobeQuizItem[]> {
  try {
    const res = await fetch(GLOBE_GAME_CSV_URL);
    if (!res.ok) return [];

    const text = await res.text();
    const parsed = Papa.parse<string[]>(text, { header: false, skipEmptyLines: "greedy" });
    const liveItems: GlobeQuizItem[] = [];

    parsed.data.slice(1).forEach((cols, i) => {
      const countryName = cols[1]?.replace(/"/g, "").trim();
      const code = cols[2]?.replace(/"/g, "").trim() || "UN";
      const capital = cols[3]?.replace(/"/g, "").trim() || "Capital Region";
      const population = cols[4]?.replace(/"/g, "").trim();
      const region = cols[5]?.replace(/"/g, "").trim() || "Global";
      const promptTypeRaw = cols[6]?.replace(/"/g, "").trim().toLowerCase();
      const lat = parseFloat(cols[7]);
      const lng = parseFloat(cols[8]);

      if (countryName) {
        let promptType: "flag" | "country" | "capital" = "country";
        if (promptTypeRaw === "flag" || promptTypeRaw === "capital") {
          promptType = promptTypeRaw;
        }

        liveItems.push({
          id: `live_3d_quiz_${i}`,
          countryName,
          code,
          capital,
          population,
          region,
          promptType,
          lat: Number.isFinite(lat) ? lat : 10,
          lng: Number.isFinite(lng) ? lng : 10
        });
      }
    });

    return liveItems;
  } catch (err) {
    console.warn("Using default 3D globe game questions:", err);
    return [];
  }
}
