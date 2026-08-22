
function initBlankSheet() {
  luckysheet.create({
      container: 'luckysheet',
      data: [
        {
          name: "Sheet1",
          color: "",
          status: "1",
          order: "0",
          celldata: [],
          config: {},
          index: 0
        }
      ],
      lang: 'en',
      allowEdit: true,
      showtoolbar: true,
      showinfobar: false,
      showsheetbar: true,
      showstatbar: true
    });
}
