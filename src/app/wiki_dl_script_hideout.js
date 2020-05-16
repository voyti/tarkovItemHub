// use on https://escapefromtarkov.gamepedia.com/Hideout
var c = [];

document.querySelectorAll('.wikitable').forEach((table) => (table.style.display = 'table'))
document.querySelectorAll('.wikitable').forEach((table) => {
  const tbody = table.children[0];
  const rows = tbody.children;
  const nameCell = rows[0].children[0];
  const lvlRows = _.drop(rows, 2);
  const moduleLevelsData = [];

  _.forEach(lvlRows, (lvlRow) => {
    const lvlData = {};
    const lvlCell = lvlRow.children[0];
    const reqCellList = lvlRow.children[1].children[0] ? lvlRow.children[1].children[0] : lvlRow.children[1];

   lvlData.level = lvlCell.innerText;
   lvlData.requirements = [];

   _.forEach(reqCellList.children, (listItem) => {
     const addInfo = listItem.innerText;
     const linkEl = listItem.querySelector('a');
     const wikiUrl = linkEl ? listItem.querySelector('a').getAttribute('href') : null;
     const name = linkEl ? listItem.querySelector('a').innerText : null;
     const isItem = wikiUrl && wikiUrl.startsWith('/Hideout') ? false : true;
     lvlData.requirements.push({
       addInfo,
       wikiUrl,
       name,
       isItem,
     })
   });
  moduleLevelsData.push(lvlData);
  });

  c.push({
   levels: moduleLevelsData,
   name: nameCell.innerText.split('\n')[0],
   addInfo: nameCell.innerText.split('\n')[1],
  });

});
