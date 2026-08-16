export interface BulkVariety {
  commonName: string;
  species: string;
  chillHours?: number;
  hardinessZone?: string;
  pollinationGroup?: string;
  harvestWindow?: string;
  flavorNotes?: string;
  diseaseResistanceNotes?: string;
  originNotes?: string;
  selfFertile?: boolean;
  triploid?: boolean;
  diseaseRating?: number;
  heritage?: boolean;
  synonyms?: string[];
}

export const bulkVarieties: BulkVariety[] = [
  // Apples (Malus domestica)
  { commonName: "Adam's Pearmain", species: "Malus domestica", chillHours: 500, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - March", flavorNotes: "Nutty, aromatic dessert apple.", originNotes: "Herefordshire or Norfolk, England, c.1826.", heritage: true },
  { commonName: "Allington Pippin", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - December", flavorNotes: "Aromatic, sharp dessert and cooking apple.", originNotes: "Lincolnshire, 1890s.", heritage: true },
  { commonName: "Annie Elizabeth", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - April", flavorNotes: "Sweet cooking apple that keeps its shape.", originNotes: "Leicester, England, 1857.", heritage: true },
  { commonName: "Beauty of Bath", species: "Malus domestica", chillHours: 500, hardinessZone: "4-8", pollinationGroup: "1", harvestWindow: "July - August", flavorNotes: "Early sharp-sweet apple.", originNotes: "Somerset, England, 1864.", heritage: true },
  { commonName: "Blenheim Orange", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - January", flavorNotes: "Dual-purpose with nutty flavour.", originNotes: "Woodstock, Oxfordshire, c.1740.", triploid: true, heritage: true, synonyms: ["Blenheim"] },
  { commonName: "Braeburn", species: "Malus domestica", chillHours: 700, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "October - January", flavorNotes: "Sweet-tart, crisp and firm.", originNotes: "New Zealand, 1950s." },
  { commonName: "Charles Ross", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "September - November", flavorNotes: "Dual-purpose, sweet and juicy.", originNotes: "Berkshire, England, 1890.", heritage: true },
  { commonName: "Court Pendu Plat", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "6", harvestWindow: "October - April", flavorNotes: "Late, sweet-sharp, aromatic.", originNotes: "An ancient variety, possibly Roman.", heritage: true },
  { commonName: "Crispin", species: "Malus domestica", chillHours: 700, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - February", flavorNotes: "Large, sweet-sharp, dual-purpose.", originNotes: "Japan, 1930s.", synonyms: ["Mutsu"] },
  { commonName: "Devonshire Quarrenden", species: "Malus domestica", chillHours: 500, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "August", flavorNotes: "Early, crisp, sweet dessert apple.", originNotes: "Devon, England, 17th century.", heritage: true },
  { commonName: "Ellison's Orange", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "September - October", flavorNotes: "Aniseed-scented dessert apple.", originNotes: "Lincolnshire, 1904.", heritage: true },
  { commonName: "Fiesta", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - December", flavorNotes: "Cox-like flavour with better health.", originNotes: "Kent, England, 1972.", synonyms: ["Red Pippin"] },
  { commonName: "Gala", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "September - October", flavorNotes: "Sweet, aromatic, crisp.", originNotes: "New Zealand, 1934." },
  { commonName: "Golden Delicious", species: "Malus domestica", chillHours: 700, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "October - January", flavorNotes: "Sweet, mellow, all-purpose.", originNotes: "West Virginia, USA, 1890.", selfFertile: true },
  { commonName: "Golden Noble", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "October - December", flavorNotes: "Excellent cooking apple.", originNotes: "Norfolk, England, 1820.", heritage: true },
  { commonName: "Granny Smith", species: "Malus domestica", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "November - March", flavorNotes: "Sharp, crisp, green dessert and cooking apple.", originNotes: "Australia, 1868.", selfFertile: true },
  { commonName: "Greensleeves", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "September - November", flavorNotes: "Sweet, crisp, golden-green.", originNotes: "Kent, England, 1966.", selfFertile: true },
  { commonName: "Howgate Wonder", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - January", flavorNotes: "Very large cooking apple.", originNotes: "Isle of Wight, 1915." },
  { commonName: "James Grieve", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Juicy, tangy, dual-purpose.", originNotes: "Scotland, 1893.", selfFertile: true, heritage: true },
  { commonName: "Jonagold", species: "Malus domestica", chillHours: 700, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "October - December", flavorNotes: "Honeyed, sweet-sharp.", originNotes: "USA, 1943.", triploid: true },
  { commonName: "Katy", species: "Malus domestica", chillHours: 500, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "August - September", flavorNotes: "Early red dessert apple.", originNotes: "Sweden, 1947.", synonyms: ["Katja"] },
  { commonName: "King of the Pippins", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "October - January", flavorNotes: "Sharp, sweet, keeps well.", originNotes: "France, 19th century.", heritage: true, synonyms: ["Reine des Reinettes"] },
  { commonName: "Laxton's Superb", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "October - January", flavorNotes: "Sweet, aromatic dessert apple.", originNotes: "Bedfordshire, 1897.", heritage: true },
  { commonName: "Lord Lambourne", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "2", harvestWindow: "September - November", flavorNotes: "Sweet, juicy, aromatic.", originNotes: "Bedfordshire, 1907.", heritage: true },
  { commonName: "Norfolk Royal", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "September - October", flavorNotes: "Sweet, crisp dessert apple.", originNotes: "Norfolk, England, 1908.", heritage: true },
  { commonName: "Orleans Reinette", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "November - February", flavorNotes: "Rich, nutty dessert apple.", originNotes: "France, 18th century.", heritage: true },
  { commonName: "Peasgood's Nonsuch", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - December", flavorNotes: "Large dual-purpose apple.", originNotes: "Lincolnshire, 1853.", heritage: true },
  { commonName: "Pitmaston Pine Apple", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "September - November", flavorNotes: "Small, sweet, pineapple-flavoured.", originNotes: "Worcestershire, 1785.", heritage: true },
  { commonName: "Ribston Pippin", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - January", flavorNotes: "Intensely aromatic, parent of Cox.", originNotes: "Yorkshire, England, 1707.", triploid: true, heritage: true },
  { commonName: "Rosemary Russet", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - January", flavorNotes: "Sweet-sharp russet, great for cider and eating.", originNotes: "England, 1831.", heritage: true },
  { commonName: "Spartan", species: "Malus domestica", chillHours: 800, hardinessZone: "3-8", pollinationGroup: "3", harvestWindow: "October - December", flavorNotes: "Sweet, crisp, dark red.", originNotes: "Canada, 1926." },
  { commonName: "St Edmund's Pippin", species: "Malus domestica", chillHours: 500, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Early, pear-drop flavoured russet.", originNotes: "Suffolk, England, 1870.", heritage: true, synonyms: ["St Edmund's Russet"] },
  { commonName: "Worcester Pearmain", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Early strawberry-flavoured apple.", originNotes: "Worcestershire, 1873.", heritage: true },
  { commonName: "Wyken Pippin", species: "Malus domestica", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "3", harvestWindow: "October - December", flavorNotes: "Sweet, rich, aromatic dessert apple.", originNotes: "Netherlands, 18th century.", heritage: true },

  // Pears (Pyrus communis)
  { commonName: "Beth", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Early, sweet, juicy dessert pear.", originNotes: "Kent, England, 1938." },
  { commonName: "Beurré Hardy", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "October", flavorNotes: "Sweet, perfumed dessert pear.", originNotes: "France, 1820.", heritage: true },
  { commonName: "Concorde", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "October - November", flavorNotes: "Sweet, melting flesh; Comice × Conference.", originNotes: "Kent, England, 1977." },
  { commonName: "Doyenné du Comice", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "October - November", flavorNotes: "The finest-flavoured dessert pear.", originNotes: "France, 1849.", synonyms: ["Comice"] },
  { commonName: "Glou Morceau", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "November - December", flavorNotes: "Sweet, rich, late-keeping pear.", originNotes: "Belgium, 1750.", heritage: true },
  { commonName: "Louise Bonne of Jersey", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "2", harvestWindow: "September - October", flavorNotes: "Sweet, juicy dessert pear.", originNotes: "France, 1780.", heritage: true },
  { commonName: "Onward", species: "Pyrus communis", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "September", flavorNotes: "Sweet, Comice-type dessert pear.", originNotes: "England, 1947." },
  { commonName: "Winter Nelis", species: "Pyrus communis", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "November - February", flavorNotes: "Small, sweet, late-keeping pear.", originNotes: "Belgium, 1818.", heritage: true },

  // Plums and gages (Prunus domestica)
  { commonName: "Czar", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "August", flavorNotes: "Reliable culinary plum.", originNotes: "England, 1874.", selfFertile: true, heritage: true },
  { commonName: "Marjorie's Seedling", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "September - October", flavorNotes: "Late, sweet-sharp dessert and cooking plum.", originNotes: "Berkshire, England, 1912.", heritage: true },
  { commonName: "Opal", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "August", flavorNotes: "Early dessert plum.", originNotes: "Sweden, 1925.", selfFertile: true },
  { commonName: "Oullins Golden Gage", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "2", harvestWindow: "August", flavorNotes: "Sweet golden gage.", originNotes: "France, 1860.", heritage: true, synonyms: ["Reine Claude d'Oullins"] },
  { commonName: "Cambridge Gage", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Sweet, honeyed green gage.", originNotes: "Cambridge, England, 1920.", heritage: true },
  { commonName: "Denniston's Superb", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "2", harvestWindow: "August", flavorNotes: "Sweet golden gage.", originNotes: "USA, 1835.", heritage: true },
  { commonName: "Coe's Golden Drop", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "2", harvestWindow: "September", flavorNotes: "Sweet, rich, late dessert plum.", originNotes: "England, 18th century.", heritage: true },
  { commonName: "President", species: "Prunus domestica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Large, late dessert and cooking plum.", originNotes: "Hertfordshire, England, 1901." },

  // Cherries (Prunus avium)
  { commonName: "Bigarreau Napoleon", species: "Prunus avium", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "July", flavorNotes: "Firm, sweet white-fleshed cherry.", originNotes: "Europe, 19th century.", heritage: true, synonyms: ["Napoleon"] },
  { commonName: "Lapins", species: "Prunus avium", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "July", flavorNotes: "Sweet dark cherry.", originNotes: "Canada, 1983.", selfFertile: true },
  { commonName: "Morello", species: "Prunus cerasus", chillHours: 800, hardinessZone: "4-8", pollinationGroup: "4", harvestWindow: "July - August", flavorNotes: "Sour cherry for cooking and preserves.", originNotes: "Europe, ancient origin.", selfFertile: true, heritage: true },
  { commonName: "Penny", species: "Prunus avium", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "July - August", flavorNotes: "Late dark dessert cherry.", originNotes: "England, 1982.", selfFertile: true },
  { commonName: "Stella", species: "Prunus avium", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "July", flavorNotes: "Sweet, dark dessert cherry.", originNotes: "Canada, 1968.", selfFertile: true },
  { commonName: "Sunburst", species: "Prunus avium", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "4", harvestWindow: "July", flavorNotes: "Sweet dark cherry.", originNotes: "Canada, 1979.", selfFertile: true },
  { commonName: "Sweetheart", species: "Prunus avium", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "August", flavorNotes: "Late sweet cherry.", originNotes: "Canada, 1990.", selfFertile: true },

  // Damsons
  { commonName: "Merryweather Damson", species: "Prunus domestica subsp. insititia", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Large, less astringent damson.", originNotes: "Nottinghamshire, England, 1907.", selfFertile: true, heritage: true, synonyms: ["Merryweather"] },
  { commonName: "Shropshire Prune", species: "Prunus domestica subsp. insititia", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "3", harvestWindow: "September", flavorNotes: "Classic damson for jam and gin.", originNotes: "Shropshire, England, 17th century.", selfFertile: true, heritage: true },

  // Other fruits
  { commonName: "Quince Meeches Prolific", species: "Cydonia oblonga", chillHours: 500, hardinessZone: "5-9", pollinationGroup: "N/A", harvestWindow: "October", flavorNotes: "Aromatic quince, good cropper.", selfFertile: true },
  { commonName: "Quince Champion", species: "Cydonia oblonga", chillHours: 500, hardinessZone: "5-9", pollinationGroup: "N/A", harvestWindow: "October", flavorNotes: "Large-fruited quince.", selfFertile: true },
  { commonName: "Dutch Medlar", species: "Mespilus germanica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "N/A", harvestWindow: "November (bletted)", flavorNotes: "Large, sweet medlar.", selfFertile: true, heritage: true },
  { commonName: "Royal Medlar", species: "Mespilus germanica", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "N/A", harvestWindow: "November (bletted)", flavorNotes: "Fine-flavoured medlar.", selfFertile: true },
  { commonName: "Black Mulberry", species: "Morus nigra", chillHours: 200, hardinessZone: "6-9", pollinationGroup: "N/A", harvestWindow: "August - September", flavorNotes: "Rich, juicy berries.", selfFertile: true, heritage: true, synonyms: ["Chelsea Mulberry"] },
  { commonName: "Brown Turkey", species: "Ficus carica", chillHours: 100, hardinessZone: "7-10", pollinationGroup: "N/A", harvestWindow: "August - October", flavorNotes: "Sweet, reliable fig.", selfFertile: true },
  { commonName: "Moorpark Apricot", species: "Prunus armeniaca", chillHours: 600, hardinessZone: "5-8", pollinationGroup: "N/A", harvestWindow: "August", flavorNotes: "Sweet, aromatic apricot.", originNotes: "Hertfordshire, England, 1760.", selfFertile: true, heritage: true, synonyms: ["Moor Park"] },
  { commonName: "Peregrine Peach", species: "Prunus persica", chillHours: 800, hardinessZone: "6-9", pollinationGroup: "N/A", harvestWindow: "August", flavorNotes: "Sweet white-fleshed peach.", originNotes: "England, 1906.", selfFertile: true },
  { commonName: "Robijn Almond", species: "Prunus dulcis", chillHours: 500, hardinessZone: "6-9", pollinationGroup: "N/A", harvestWindow: "September", flavorNotes: "Sweet, reliable almond.", originNotes: "Netherlands.", selfFertile: true },
  { commonName: "Broadview Walnut", species: "Juglans regia", chillHours: 700, hardinessZone: "5-8", pollinationGroup: "N/A", harvestWindow: "October", flavorNotes: "Sweet walnuts.", selfFertile: true },
  { commonName: "Webb's Prize Cob", species: "Corylus avellana", chillHours: 800, hardinessZone: "4-8", pollinationGroup: "N/A", harvestWindow: "September", flavorNotes: "Large, sweet cobnut.", originNotes: "England, 19th century.", heritage: true },
  { commonName: "Purple Filbert", species: "Corylus maxima", chillHours: 800, hardinessZone: "4-8", pollinationGroup: "N/A", harvestWindow: "September", flavorNotes: "Ornamental and edible purple filbert.", heritage: true },
  { commonName: "White Grape Elder", species: "Sambucus nigra", chillHours: 600, hardinessZone: "4-8", pollinationGroup: "N/A", harvestWindow: "September", flavorNotes: "White elderberries for cordial.", selfFertile: true },
  { commonName: "Duke Blueberry", species: "Vaccinium corymbosum", chillHours: 800, hardinessZone: "4-7", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Early highbush blueberry.", selfFertile: true },
  { commonName: "Earliblue Blueberry", species: "Vaccinium corymbosum", chillHours: 800, hardinessZone: "4-7", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Early sweet blueberry.", selfFertile: true },
  { commonName: "Ben Hope Blackcurrant", species: "Ribes nigrum", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Late, large-fruited blackcurrant.", selfFertile: true },
  { commonName: "Ben Lomond Blackcurrant", species: "Ribes nigrum", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "August", flavorNotes: "Late blackcurrant, good for freezing.", selfFertile: true },
  { commonName: "Jonkheer van Tets Redcurrant", species: "Ribes rubrum", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "June - July", flavorNotes: "Early redcurrant.", selfFertile: true },
  { commonName: "Invicta Gooseberry", species: "Ribes uva-crispa", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Green culinary gooseberry.", originNotes: "England, 1982.", selfFertile: true },
  { commonName: "Leveller Gooseberry", species: "Ribes uva-crispa", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Large sweet yellow gooseberry.", selfFertile: true, heritage: true },
  { commonName: "Autumn Bliss Raspberry", species: "Rubus idaeus", chillHours: 800, hardinessZone: "4-8", pollinationGroup: "N/A", harvestWindow: "August - October", flavorNotes: "Autumn-fruiting raspberry.", selfFertile: true },
  { commonName: "Glen Ample Raspberry", species: "Rubus idaeus", chillHours: 800, hardinessZone: "4-8", pollinationGroup: "N/A", harvestWindow: "June - July", flavorNotes: "Summer-fruiting raspberry.", selfFertile: true },
  { commonName: "Loch Ness Blackberry", species: "Rubus fruticosus", chillHours: 700, hardinessZone: "5-9", pollinationGroup: "N/A", harvestWindow: "August - September", flavorNotes: "Thornless blackberry.", selfFertile: true },
  { commonName: "Jostaberry", species: "Ribes × nidigrolaria", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Blackcurrant × gooseberry cross.", selfFertile: true },
  { commonName: "Chilean Guava", species: "Ugni molinae", chillHours: 300, hardinessZone: "8-10", pollinationGroup: "N/A", harvestWindow: "October - November", flavorNotes: "Aromatic, strawberry-flavoured berries.", selfFertile: true },
  { commonName: "Gooseberry Pax", species: "Ribes uva-crispa", chillHours: 1000, hardinessZone: "3-8", pollinationGroup: "N/A", harvestWindow: "July", flavorNotes: "Nearly spineless red gooseberry.", selfFertile: true },
];
