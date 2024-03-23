export default (oddsArray: Array<number>) => {
  let cumulativeOdds = 1;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < oddsArray.length; i++) {
    const odds = oddsArray[i];

    if (odds > 0) {
      cumulativeOdds *= odds / 100 + 1;
    } else if (odds < 0) {
      cumulativeOdds *= 100 / -odds + 1;
    } else {
      // Handle even odds (e.g., +100, -100)
      cumulativeOdds *= 2;
    }
  }

  return cumulativeOdds;
};
