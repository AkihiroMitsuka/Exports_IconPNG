// Copyrightレイヤーの表示・非表示を切り替える関数
function showCopyrightLayer(doc, displayCopyright) {
  var copyrightLayer = doc.layers.getByName("Copyright");
  if (displayCopyright) {
    copyrightLayer.visible = true;
  } else {
    copyrightLayer.visible = false;
  }
}

// Copyrightレイヤーの表示・非表示を選択するダイアログを表示する関数
function showCopyrightDialog() {
  var dialog = new Window("dialog", "Copyright Layer");
  dialog.add("statictext", [10, 10, 200, 30], "Copyright Layerを表示しますか？");
  var radioButtonGroup = dialog.add("group", undefined);
  radioButtonGroup.orientation = "row";
  radioButtonGroup.add("radiobutton", undefined, "表示する");
  radioButtonGroup.add("radiobutton", undefined, "表示しない");
  radioButtonGroup.children[0].value = true;

  dialog.add("button", [10, 50, 100, 80], "OK", { name: "ok" });
  dialog.add("button", [110, 50, 200, 80], "キャンセル", { name: "cancel" });

  var result = dialog.show();

  if (result === 1) {
    return radioButtonGroup.children[0].value;
  } else {
    return null;
  }
}

// 背景を指定してレイヤーを書き出す関数
function exportLayerWithBackground(doc, layer, backgroundName, backgroundColor, outputFolder, displayCopyright) {
  // 全てのレイヤーを非表示にする
  for (var j = 0; j < muskGroup.layers.length; j++) {
    muskGroup.layers[j].visible = false;
  }

  // 対象のレイヤーを表示にする
  layer.visible = true;

  // Copyrightレイヤーを表示
  showCopyrightLayer(doc, displayCopyright);

  //背景の表示非表示を設定
  A_Wh.visible = backgroundColor === "Wh";
  A_Bk.visible = backgroundColor === "Bk";

  // 書き出し
  var saveFile = new File(outputFolder + "/" + layer.name + "_" + backgroundName + ".png");
  var saveOptions = new ExportOptionsSaveForWeb();
  saveOptions.format = SaveDocumentType.PNG;
  saveOptions.PNG8 = false;
  saveOptions.transparency = true;
  saveOptions.interlaced = false;
  saveOptions.includeProfile = false;
  saveOptions.optimized = true;
  saveOptions.quality = 100;
  doc.exportDocument(saveFile, ExportType.SAVEFORWEB, saveOptions);
}

// プログレスバーを作成する関数
function createProgressBar() {
  var win = new Window("palette", "Progress", [150, 150, 600, 260]);
  win.add("statictext", [10, 10, 420, 40], "Processing layers...");
  var progressBar = win.add("progressbar", [10, 50, 440, 70], 0, 100);
  win.show();
  return { win: win, progressBar: progressBar };
}

// ドキュメントと各レイヤーを取得
var doc = app.activeDocument;

var muskGroup = doc.layerSets.getByName("MuskGroup");
var A_Wh = doc.layers.getByName("AlphaBg_Wh");
var A_Bk = doc.layers.getByName("AlphaBg_Bk");

// 出力フォルダを選択
var outputFolder = Folder.selectDialog("書き出し先フォルダを選択してください");

if (outputFolder) {
  try {
    // Copyright表示の設定を取得
    var displayCopyright = showCopyrightDialog();

    // プログレスバーを作成
    var progress = createProgressBar();
    var totalLayers = muskGroup.layers.length * 2;
    var processedLayers = 0;

    // 白背景で書き出し
    for (var i = 0; i < muskGroup.layers.length; i++) {
      exportLayerWithBackground(doc, muskGroup.layers[i], "Wh", "Wh", outputFolder, displayCopyright);
      processedLayers++;
      progress.progressBar.value = (processedLayers / totalLayers) * 100;
      progress.win.update();
    }

    // 黒背景で書き出し
    for (var i = 0; i < muskGroup.layers.length; i++) {
      exportLayerWithBackground(doc, muskGroup.layers[i], "Bk", "Bk", outputFolder, displayCopyright);
      processedLayers++;
      progress.progressBar.value = (processedLayers / totalLayers) * 100;
      progress.win.update();
    }

    // プログレスバーを閉じる
    progress.win.close();

    // 完了メッセージを表示
    alert("PNGの書き出し処理が完了いたしました。ご確認ください。");
  } catch (error) {
    // エラーメッセージを表示
    alert("エラーが発生しました: " + error.toString());
  }
} else {
  // キャンセルメッセージを表示
  alert("書き出し先が選択されませんでした。処理を中止します。");
}