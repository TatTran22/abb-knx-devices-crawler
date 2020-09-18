let products = [];

a = () => {
  for (let i = 0; i < 100; i++) {
    let el = document.querySelector(`#productBrowserAdditionalInfo${i}`);
    let ela = document.querySelectorAll('td.pb_IdColumn a')[i];
    if (el) {
      products.push(el.textContent.trim());
    } else {
      products.push(ela.textContent.trim());
    }
  }
  return products.length;
};
