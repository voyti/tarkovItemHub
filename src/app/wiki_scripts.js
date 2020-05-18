////////////////////////////////// BARTER //////////////////////////////////////////////////////

// use on https://escapefromtarkov.gamepedia.com/Barter_trades
var getFromWiki = () => {
  var a = [];
  // document.querySelectorAll('#mw-content-text > div > table > tbody').forEach((tbody) => {
  document.querySelectorAll('#content-collapsible-block-0 > table:nth-child(2) > tbody').forEach((tbody) => {

    _.tail(tbody.children).forEach(tr => {
      const th = tr.children;
      const inputInfoEl = th[0];
      const traderEl = th[2];
      const outputInfoEl = th[4];

      const itemEls = _.chunk(_.filter(_.map(inputInfoEl.children), (c) => c.tagName == 'A' || c.tagName == 'P'), 2);
      const amounts = inputInfoEl.innerText.split('\n').filter((d) => d.startsWith(' x'));


      const inputInfo = itemEls.map((itemEl, i) => {
        const _item = _.clone(itemEl);
        const imgContainer = _item[0].children[0] || _item[1].children[0];
        return {
            fullName: _item[0].getAttribute('title'),
            wikiHref: _item[0].getAttribute('href'),
            imgUrl: imgContainer.getAttribute('src'),
            shortName: _item[1] ? _item[1].innerText : _item[0].getAttribute('title'),
            amount: amounts[i],
        }
      });


      const traderImgEl = _.first(traderEl.children);
      const traderInfoEl = _.last(traderEl.children);

      const traderInfo = {
        name: traderInfoEl.getAttribute('title'),
        wikiHref: traderInfoEl.getAttribute('href'),
        levelLabel: traderInfoEl.innerText,
        level: traderInfoEl.innerText.replace('LL', ''),
        imgUrl: traderImgEl.children[0].getAttribute('src'),
      };

      const outputEl = outputInfoEl.children[0];
      let shortNameEl =  _.last(_.filter(outputInfoEl.children, (c) => _.includes(['A', 'P'], c.tagName)));
      shortNameEl = shortNameEl.tagName === 'P' ? shortNameEl.children[0] : shortNameEl;

      const outputInfo = {
        fullName: outputEl.getAttribute('title'),
        wikiHref: outputEl.getAttribute('href'),
        imgUrl: outputEl.children[0].getAttribute('src'),
        shortName: shortNameEl.innerText,
      };
      a.push({
        inputInfo,
        traderInfo,
        outputInfo,
      })
    })
  });

  return a;
};

////////////////////////////////// HIDEOUT //////////////////////////////////////////////////////


var c = [];
// https://escapefromtarkov.gamepedia.com/Hideout
var getFromHideout = () => {
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

    const reqCellList = lvlRow.children[1].querySelector('ul') ? lvlRow.children[1].querySelector('ul') : lvlRow.children[1];

   lvlData.level = lvlCell.innerText;
   lvlData.requirements = [];

   if (reqCellList.children.length) {
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
       });
     });
   } else {
     lvlData.requirements.push({ name: reqCellList.innerText });
   }

  moduleLevelsData.push(lvlData);
  });

  c.push({
   levels: moduleLevelsData,
   name: nameCell.innerText.split('\n')[0],
   addInfo: nameCell.innerText.split('\n')[1],
  });

});
};
////////////////////////////////// QUESTS //////////////////////////////////////////////////////

// https://escapefromtarkov.gamepedia.com/Quests
var getFromQuests = () => {
var d = [];
document.querySelectorAll('.wikitable').forEach((table) => (table.style.display = 'table'))
document.querySelectorAll('.wikitable').forEach((table) => {
  const tbody = table.children[0];
  const rows = tbody.children;
  const nameCell = rows[0].children[0];
  const questRows = _.drop(rows, 2);
  const questRequirementsData = [];

  _.forEach(questRows, (questRow) => {
    const questData = {};
    const nameCell = questRow.children[0].querySelector('a');
    const objectiveList = questRow.children[2].children[0] ? questRow.children[2].children[0] : questRow.children[2];

   questData.name = nameCell.innerText;
   questData.wikiHref = nameCell.getAttribute('href');
   questData.objectives = [];

   _.forEach(objectiveList.children, (objectiveItem) => {
     const text = objectiveItem.innerText;
     questData.objectives.push(text)
   });
  questRequirementsData.push(questData);
  });

  d.push({
   quests: questRequirementsData,
   name: nameCell.innerText,
  });

});
};

////////////////////////////////// LOOT //////////////////////////////////////////////////////

// use on https://eft-loot.com/
var getFromLoot = () => {
  var b = [];
  _.forEach(_.tail(document.querySelectorAll('#items_table > div')), (row) => {
      const cells = _.clone(_.map(row.children));
      b.push({
        name: cells[1].children[0].children[0].innerText,
        avgPrice: cells[3].children[0].innerText,
        pricePerSlot: cells[4].children[0].innerText,
        updated: cells[5].children[0].innerText,
      });
  });
  return b;

};

////////////////////// AMMO ///////////////////////////
//https://escapefromtarkov.gamepedia.com/Ammunition
const getFromAmmo = () => {
  var ammoData = [];
  var rows = [];
  document.querySelectorAll('.wikitable.sortable').forEach((table) => {
    const tbody = table.querySelector('tbody');
    rows.push(...tbody.children)
  });
  _.forEach(rows, (ammoRow) => {
    const typeCell = ammoRow.children[0].querySelector('a');
    const weaponsCell = ammoRow.children[2];
    ammoData.push({
      name: typeCell.getAttribute('title'),
      wikiHref: typeCell.getAttribute('href'),
      imgUrl:  typeCell.querySelector('img').getAttribute('src'),
      weapons: _.map(weaponsCell.querySelectorAll('a'), (a) => ({ name: a.innerText, wikiHref: a.getAttribute('href'), })),
    })
  })


}

// any like https://escapefromtarkov.gamepedia.com/5.45x39mm
const getFromAmmoIcons = () => {
  var ammoData = [];
  var rows = [];
  document.querySelectorAll('.wikitable.sortable').forEach((table) => {
    const tbody = table.querySelector('tbody');
    rows.push(...tbody.children)
  });
  _.forEach(rows, (ammoRow) => {
    const typeCell = ammoRow.children[0].querySelector('a');
    const weaponsCell = ammoRow.children[2];
    ammoData.push({
      name: typeCell.getAttribute('title'),
      wikiHref: typeCell.getAttribute('href'),
      imgUrl:  typeCell.querySelector('img').getAttribute('src'),
      weapons: _.map(weaponsCell.querySelectorAll('a'), (a) => ({ name: a.innerText, wikiHref: a.getAttribute('href'), })),
    })
  })
}

//var csvData = '';
var getFromAmmoCsv = () => {
  let headerName = '';
  let headerNameWiki = '';
  const flatData = _.map(csvData.split('|'), (ammoLine) => {
    const splitData = ammoLine.split(',');
    const category = splitData[0].length ? splitData[0] : headerName;
    const wikiCategory = _.last(splitData).length ? _.last(splitData) : headerNameWiki;
    headerName = category;
    headerNameWiki = wikiCategory;
    splitData[0] = category;
    splitData[splitData.length - 1] = wikiCategory;

    return {
      category,
      wikiCategory,
      name: splitData[1],
      damage: splitData[3],
      penValue: splitData[4],
      armorPenPerc: splitData[5],
      fragChance: splitData[6],
      penArm1: splitData[7],
      penArm2: splitData[8],
      penArm3: splitData[9],
      penArm4: splitData[10],
      penArm5: splitData[11],
      penArm6: splitData[12],
    };
  })

  return _.transform(flatData, (all, el) => {
    const catEl = _.find(all, ['category', el.category]);
    const guaranteedEl = catEl || { category: el.category, wikiCategory: el.wikiCategory, ammoTypes: [] };
    guaranteedEl.ammoTypes.push(el);
    if (!catEl) all.push(guaranteedEl);
  }, [])
};