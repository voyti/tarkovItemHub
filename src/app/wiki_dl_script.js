// use on https://escapefromtarkov.gamepedia.com/Barter_trades
var a = [];
document.querySelectorAll('#mw-content-text > div > table > tbody').forEach((tbody) => {

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